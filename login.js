const users = [
    { vehicleNumber: "ABC123", licenseNumber: "DL12345" },
    { vehicleNumber: "XYZ789", licenseNumber: "DL67890" }
];

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'parking.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const vehicleNumber = document.getElementById('vehicleNumber').value.toUpperCase();
        const licenseNumber = document.getElementById('licenseNumber').value;

        const user = users.find(u => 
            u.vehicleNumber === vehicleNumber && 
            u.licenseNumber === licenseNumber
        );

        if (user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('vehicleNumber', vehicleNumber);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            window.location.href = 'parking.html';
        } else {
            errorMessage.textContent = 'Invalid vehicle number or license number!';
            setTimeout(() => {
                errorMessage.textContent = '';
            }, 3000);
        }
    });
});