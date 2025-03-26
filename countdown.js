document.addEventListener('DOMContentLoaded', () => {
    const bookingDetails = sessionStorage.getItem('bookingDetails');
    if (!bookingDetails) {
        window.location.href = 'parking.html';
        return;
    }

    const booking = JSON.parse(bookingDetails);
    
    document.getElementById('spotNumber').textContent = booking.spot;
    document.getElementById('vehicleNumber').textContent = booking.vehicle;
    document.getElementById('duration').textContent = booking.hours;
    document.getElementById('amountPaid').textContent = booking.total;

    const now = new Date().getTime();
    const endTime = booking.endTimestamp;
    const totalDuration = booking.hours * 60 * 60 * 1000;
    const timeLeft = endTime - now;
    
    if (timeLeft > 0) {
        startCountdown(endTime, totalDuration);
    } else {
        showExpired();
    }
});

function startCountdown(endTime, totalDuration) {
    const progressBar = document.getElementById('progress');
    const alertSound = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA==');

    let lastUpdate = 0;
    const minUpdateInterval = 100;

    function updateTimer(timestamp) {
        if (timestamp - lastUpdate >= minUpdateInterval) {
            const now = new Date().getTime();
            const distance = endTime - now;

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

            const percentage = (distance / totalDuration) * 100;
            progressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;

            const statusMessage = document.getElementById('statusMessage');

            if (distance < 1800000 && distance > 600000) {
                statusMessage.textContent = "Warning: Less than 30 minutes remaining!";
                statusMessage.className = "status-message warning";
                progressBar.className = "progress warning";
                if (!document.hidden) {
                    alertSound.play();
                }
            } else if (distance < 600000 && distance > 0) {
                statusMessage.textContent = "Critical: Less than 10 minutes remaining!";
                statusMessage.className = "status-message critical";
                progressBar.className = "progress critical";
                if (!document.hidden && distance % 60000 < 1000) {
                    alertSound.play();
                }
            }

            if (distance < 0) {
                showExpired();
                return;
            }

            lastUpdate = timestamp;
        }

        requestAnimationFrame(updateTimer);
    }

    requestAnimationFrame(updateTimer);
}

function showExpired() {
    document.getElementById('hours').textContent = "00";
    document.getElementById('minutes').textContent = "00";
    document.getElementById('seconds').textContent = "00";
    
    const progressBar = document.getElementById('progress');
    progressBar.style.width = '0%';
    progressBar.className = "progress expired";
    
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = "Parking time has expired!";
    statusMessage.className = "status-message expired";

    const alertSound = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA==');
    alertSound.play();

    const parkingData = JSON.parse(localStorage.getItem('parkingData'));
    const spotNumber = document.getElementById('spotNumber').textContent;
    const spotIndex = parkingData.findIndex(spot => spot.number === spotNumber);
    
    if (spotIndex !== -1) {
        parkingData[spotIndex].isOccupied = false;
        localStorage.setItem('parkingData', JSON.stringify(parkingData));
    }

    if (confirm('Would you like to review your parking experience?')) {
        sessionStorage.setItem('reviewSpot', spotNumber);
        window.location.href = 'parking.html?showReview=true';
    } else {
        sessionStorage.removeItem('bookingDetails');
        window.location.href = 'parking.html';
    }
}

function endParking() {
    if (confirm("Are you sure you want to end parking early?")) {
        const parkingData = JSON.parse(localStorage.getItem('parkingData'));
        const spotNumber = document.getElementById('spotNumber').textContent;
        const spotIndex = parkingData.findIndex(spot => spot.number === spotNumber);
        
        if (spotIndex !== -1) {
            parkingData[spotIndex].isOccupied = false;
            localStorage.setItem('parkingData', JSON.stringify(parkingData));
        }
        
        sessionStorage.removeItem('bookingDetails');
        window.location.href = 'parking.html';
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.pause();
        }
    }
});
