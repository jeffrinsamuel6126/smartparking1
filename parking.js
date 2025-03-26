const parkingSpots = [
    // Row A
    { id: 1, number: 'A1', isOccupied: false, row: 'a' },
    { id: 2, number: 'A2', isOccupied: false, row: 'a' },
    { id: 3, number: 'A3', isOccupied: false, row: 'a' },
    { id: 4, number: 'A4', isOccupied: false, row: 'a' },
    { id: 5, number: 'A5', isOccupied: false, row: 'a' },
    { id: 6, number: 'A6', isOccupied: false, row: 'a' },
    // Row B
    { id: 7, number: 'B1', isOccupied: false, row: 'b' },
    { id: 8, number: 'B2', isOccupied: false, row: 'b' },
    { id: 9, number: 'B3', isOccupied: false, row: 'b' },
    { id: 10, number: 'B4', isOccupied: false, row: 'b' },
    { id: 11, number: 'B5', isOccupied: false, row: 'b' },
    { id: 12, number: 'B6', isOccupied: false, row: 'b' },
    // Row C
    { id: 13, number: 'C1', isOccupied: false, row: 'c' },
    { id: 14, number: 'C2', isOccupied: false, row: 'c' },
    { id: 15, number: 'C3', isOccupied: false, row: 'c' },
    { id: 16, number: 'C4', isOccupied: false, row: 'c' },
    { id: 17, number: 'C5', isOccupied: false, row: 'c' },
    { id: 18, number: 'C6', isOccupied: false, row: 'c' }
];

let currentReviewSpot = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
        return;
    }

    const savedData = localStorage.getItem('parkingData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        parkingSpots.forEach((spot, index) => {
            spot.isOccupied = parsedData[index].isOccupied;
        });
    }

    const vehicleNumber = sessionStorage.getItem('vehicleNumber');
    document.querySelector('.welcome-message').textContent = `Welcome, Vehicle: ${vehicleNumber}`;

    renderParkingSpots();
    updateCounts();
    handleStarRating();

    // Check for review prompt
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showReview') === 'true') {
        const spotNumber = sessionStorage.getItem('reviewSpot');
        if (spotNumber) {
            showReviewModal(spotNumber);
            sessionStorage.removeItem('reviewSpot');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    window.onclick = function(event) {
        const reviewModal = document.getElementById('reviewModal');
        const historyModal = document.getElementById('historyModal');
        if (event.target === reviewModal) {
            closeReviewModal();
        }
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    }
});

function updateCounts() {
    const availableCount = parkingSpots.filter(spot => !spot.isOccupied).length;
    const occupiedCount = parkingSpots.filter(spot => spot.isOccupied).length;
    
    document.getElementById('available-count').textContent = availableCount;
    document.getElementById('occupied-count').textContent = occupiedCount;
}

function toggleSpot(id) {
    const spotIndex = parkingSpots.findIndex(spot => spot.id === id);
    if (spotIndex !== -1) {
        const spot = parkingSpots[spotIndex];
        if (!spot.isOccupied) {
            sessionStorage.setItem('selectedSpot', spot.number);
            window.location.href = 'booking.html';
        }
    }
}

function showReviewModal(spotNumber) {
    currentReviewSpot = spotNumber;
    document.getElementById('reviewSpotNumber').textContent = spotNumber;
    document.getElementById('reviewModal').style.display = 'block';
    resetReviewForm();
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentReviewSpot = null;
}

function handleStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = e.target.dataset.rating;
            stars.forEach(s => {
                s.classList.toggle('active', s.dataset.rating <= rating);
            });
        });
    });
}

function resetReviewForm() {
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    document.getElementById('reviewComment').value = '';
}

function submitReview() {
    const rating = document.querySelectorAll('.star.active').length;
    const comment = document.getElementById('reviewComment').value;
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }

    let reviews = JSON.parse(localStorage.getItem('parkingReviews')) || {};
    reviews[currentReviewSpot] = {
        rating,
        comment,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('parkingReviews', JSON.stringify(reviews));
    closeReviewModal();
    renderParkingSpots();
}

function showHistory() {
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    const currentVehicle = sessionStorage.getItem('vehicleNumber');
    
    const vehicleHistory = bookingHistory
        .filter(booking => booking.vehicle === currentVehicle)
        .sort((a, b) => b.timestamp - a.timestamp);

    historyList.innerHTML = '';
    
    if (vehicleHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No parking history found</p>';
    } else {
        vehicleHistory.forEach(booking => {
            const now = new Date().getTime();
            const isExpired = now > booking.endTimestamp;
            
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${isExpired ? 'expired' : ''}`;
            
            historyItem.innerHTML = `
                <h4>Booking ID: ${booking.id}</h4>
                <p><strong>Spot Number:</strong> ${booking.spot}</p>
                <p><strong>Duration:</strong> ${booking.hours} hours</p>
                <p><strong>Amount Paid:</strong> ₹${booking.total}</p>
                <p><strong>Start Time:</strong> ${booking.startTime}</p>
                <p><strong>End Time:</strong> ${booking.endTime}</p>
                <p>
                    <span class="status ${isExpired ? 'expired' : 'active'}">
                        ${isExpired ? 'Expired' : 'Active'}
                    </span>
                </p>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    historyModal.style.display = 'block';
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}

function renderParkingSpots() {
    const rows = ['a', 'b', 'c'];
    const reviews = JSON.parse(localStorage.getItem('parkingReviews')) || {};
    
    rows.forEach(row => {
        const rowElement = document.getElementById(`row-${row}`);
        rowElement.innerHTML = '';
        
        const rowSpots = parkingSpots.filter(spot => spot.row === row);
        
        rowSpots.forEach(spot => {
            const spotElement = document.createElement('div');
            spotElement.className = `parking-spot ${spot.isOccupied ? 'occupied' : 'available'}`;
            
            let spotContent = `
                <div class="spot-number">${spot.number}</div>
                <div class="spot-status">${spot.isOccupied ? 'Occupied' : 'Available'}</div>
            `;

            if (reviews[spot.number]) {
                const stars = '★'.repeat(reviews[spot.number].rating) + '☆'.repeat(5 - reviews[spot.number].rating);
                spotContent += `<div class="review-info">${stars}</div>`;
            }

            spotElement.innerHTML = spotContent;

            if (spot.isOccupied) {
                spotElement.onclick = () => showReviewModal(spot.number);
            } else {
                spotElement.onclick = () => toggleSpot(spot.id);
            }

            rowElement.appendChild(spotElement);
        });
    });
    updateParkingData();
}

function updateParkingData() {
    localStorage.setItem('parkingData', JSON.stringify(parkingSpots));
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}
