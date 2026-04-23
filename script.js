/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    // Input Elements
    const collegeNameInput = document.getElementById('collegeName');
    const studentNameInput = document.getElementById('studentName');
    const usnInput = document.getElementById('usn');
    const courseNameInput = document.getElementById('courseName');
    const activityNameInput = document.getElementById('activityName');
    const activityPointsInput = document.getElementById('activityPoints');
    const dateInput = document.getElementById('certDate');

    // Display Elements
    const displayCollegeName = document.getElementById('displayCollegeName');
    const displayStudentName = document.getElementById('displayStudentName');
    const displayUsn = document.getElementById('displayUsn');
    const displayCourseName = document.getElementById('displayCourseName');
    const displayActivityName = document.getElementById('displayActivityName');
    const displayActivityPoints = document.getElementById('displayActivityPoints');
    const displayDate = document.getElementById('displayDate');

    // Set Initial Date
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
    
    // Formatting date
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // Ensure parsing works without timezone offset issues locally
        // using simple split is safer for YYYY-MM-DD strings to local timezone
        const [year, month, day] = dateStr.split('-');
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', options);
    };
    displayDate.innerText = formatDate(dateInput.value);

    // Two-way binding handler
    const bindInput = (inputEl, displayEl, isDate = false) => {
        inputEl.addEventListener('input', (e) => {
            const value = e.target.value;
            if (isDate && value) {
                displayEl.innerText = formatDate(value);
            } else {
                displayEl.innerText = value || (isDate ? 'Select Date' : '');
            }
        });
    };

    bindInput(collegeNameInput, displayCollegeName);
    bindInput(studentNameInput, displayStudentName);
    bindInput(usnInput, displayUsn);
    bindInput(courseNameInput, displayCourseName);
    bindInput(activityNameInput, displayActivityName);
    bindInput(activityPointsInput, displayActivityPoints);
    bindInput(dateInput, displayDate, true);

    // Responsive Scaling Logic for Preview
    const wrapper = document.getElementById('previewWrapper');
    const certificate = document.getElementById('certificate');
    
    const scaleCertificate = () => {
        const wrapperRect = wrapper.getBoundingClientRect();
        // Target dimensions of the certificate
        const targetWidth = 1123;
        const targetHeight = 794;
        
        // Calculate padding to maintain some space around the certificate
        const padding = 40; 
        
        const availableWidth = wrapperRect.width - padding;
        const availableHeight = wrapperRect.height - padding;
        
        const scaleX = availableWidth / targetWidth;
        const scaleY = availableHeight / targetHeight;
        
        // Fit within container
        const scale = Math.min(scaleX, scaleY);
        
        certificate.style.transform = `scale(${scale})`;
    };

    window.addEventListener('resize', scaleCertificate);
    // Initial scale
    scaleCertificate();
    setTimeout(scaleCertificate, 150); // safety catch after fonts potentially load

    // PDF Generation
    const downloadBtn = document.getElementById('downloadPdfBtn');
    
    downloadBtn.addEventListener('click', () => {
        // Change scale to 1 temporarily to ensure high quality rendering and layout precision
        certificate.style.transform = `scale(1)`;
        
        const opt = {
            margin:       0,
            filename:     `${studentNameInput.value.replace(/\s+/g, '_')}_AICTE_Certificate.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'px', format: [1123, 794], orientation: 'landscape', compress: true }
        };

        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = 'Generating PDF...';
        downloadBtn.disabled = true;

        html2pdf().set(opt).from(certificate).save().then(() => {
            // Restore scaling and button state
            scaleCertificate();
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        }).catch(err => {
            console.error("PDF generation error: ", err);
            scaleCertificate();
            downloadBtn.innerText = 'Error Generating';
            setTimeout(() => {
                downloadBtn.innerText = originalText;
                downloadBtn.disabled = false;
            }, 3000);
        });
    });
});
