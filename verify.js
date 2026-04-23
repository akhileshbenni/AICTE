document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.getElementById('verifyBtn');
    const certIdInput = document.getElementById('certIdInput');
    const resultBox = document.getElementById('resultBox');
    const errorMessage = document.getElementById('errorMessage');

    const resName = document.getElementById('resName');
    const resUsn = document.getElementById('resUsn');
    const resCourse = document.getElementById('resCourse');
    const resDate = document.getElementById('resDate');
    const resTimestamp = document.getElementById('resTimestamp');

    const performVerification = () => {
        const queryId = certIdInput.value.trim().toUpperCase();
        
        if (!queryId) return;

        // Reset UI
        resultBox.style.display = 'none';
        errorMessage.style.display = 'none';

        // Fetch from LocalStorage
        const records = JSON.parse(localStorage.getItem('aicte_certificates') || '[]');
        
        // Find matching record
        const found = records.find(r => r.id === queryId);

        if (found) {
            // Populate
            resName.innerText = found.name;
            resUsn.innerText = found.usn;
            resCourse.innerText = found.course;
            resDate.innerText = found.date;
            resTimestamp.innerText = found.timestamp || 'Unknown';
            
            // Show
            resultBox.style.display = 'block';
        } else {
            // Show Error
            errorMessage.style.display = 'block';
        }
    };

    verifyBtn.addEventListener('click', performVerification);

    certIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performVerification();
        }
    });

    // Auto-focus input on load
    certIdInput.focus();
});
