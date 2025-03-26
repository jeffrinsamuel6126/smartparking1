document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('isLoggedIn') || !sessionStorage.getItem('selectedSpot')) {
        window.location.href = 'parking.html';
        return;
    }

    const spotNumber = sessionStorage.getItem('selectedSpot');
    const vehicleNumber = sessionStorage.getItem('vehicleNumber');
    
    document.getElementById('spotNumber').textContent = spotNumber;
    document.getElementById('vehicleNumber').textContent = vehicleNumber;

    const hoursSelect = document.getElementById('hours');
    hoursSelect.addEventListener('change', calculatePrice);
    calculatePrice();
});

function calculatePrice() {
    const hours = parseInt(document.getElementById('hours').value);
    let total;
    
    if (hours <= 1) {
        total = 100.00;
    } else {
        total = 100.00 + (hours - 1) * 50.00;
    }

    total = Math.min(total, 500.00);
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

function generateReceiptId() {
    return 'PK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateReceipt(receipt) {
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Parking Receipt</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f6fa;
                }
                .receipt-container {
                    max-width: 400px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                h2 {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .receipt-details {
                    border: 1px solid #ddd;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .receipt-details p {
                    margin: 10px 0;
                    color: #2c3e50;
                }
                .total-amount {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 1.2em;
                    color: #2c3e50;
                }
                .button-container {
                    text-align: center;
                    margin-top: 25px;
                }
                .home-button {
                    background-color: #2ecc71;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }
                .home-button:hover {
                    background-color: #27ae60;
                }
                @media print {
                    .button-container {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <h2>Parking Receipt</h2>
                <div class="receipt-details">
                    <p><strong>Receipt ID:</strong> ${receipt.id}</p>
                    <p><strong>Vehicle Number:</strong> ${receipt.vehicle}</p>
                    <p><strong>Spot Number:</strong> ${receipt.spot}</p>
                    <p><strong>Duration:</strong> ${receipt.hours} hours</p>
                    <p><strong>Start Time:</strong> ${receipt.startTime}</p>
                    <p><strong>End Time:</strong> ${receipt.endTime}</p>
                    <div class="total-amount">
                        <strong>Total Amount: ₹${receipt.total}</strong>
                    </div>
                </div>
                <div class="button-container">
                    <button class="home-button" onclick="window.opener.location.href='parking.html'; window.close();">
                        Return to Homepage
                    </button>
                </div>
            </div>
        </body>
        </html>
    `;

    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.print();
}

function confirmBooking() {
    const spotNumber = sessionStorage.getItem('selectedSpot');
    const hours = document.getElementById('hours').value;
    const total = document.getElementById('totalPrice').textContent;

    const parkingData = JSON.parse(localStorage.getItem('parkingData'));
    const spotIndex = parkingData.findIndex(spot => spot.number === spotNumber);
    
    if (spotIndex !== -1) {
        parkingData[spotIndex].isOccupied = true;
        localStorage.setItem('parkingData', JSON.stringify(parkingData));
        
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (hours * 60 * 60 * 1000));
        
        const bookingDetails = {
            id: generateReceiptId(),
            spot: spotNumber,
            vehicle: sessionStorage.getItem('vehicleNumber'),
            hours: hours,
            total: total,
            startTime: startTime.toLocaleString(),
            endTime: endTime.toLocaleString(),
            timestamp: startTime.getTime(),
            endTimestamp: endTime.getTime()
        };
        
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
        
        let bookingHistory = JSON.parse(localStorage.getItem('bookingHistory')) || [];
        bookingHistory.push(bookingDetails);
        localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));

        generateReceipt(bookingDetails);
        window.location.href = 'countdown.html';
    }
}