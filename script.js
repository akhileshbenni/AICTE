/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    // Input Elements
    const collegeNameInput = document.getElementById('collegeName');
    const studentNameInput = document.getElementById('studentName');
    const usnInput = document.getElementById('usn');
    const courseNameInput = document.getElementById('courseName');
    const activityNameInput = document.getElementById('activityName');
    const activityDetailsInput = document.getElementById('activityDetails');
    const totalHoursInput = document.getElementById('totalHours');
    const durationInput = document.getElementById('duration');
    const activityPointsInput = document.getElementById('activityPoints');
    const dateInput = document.getElementById('certDate');

    // Display Elements
    const displayCollegeName = document.getElementById('displayCollegeName');
    const displayStudentName = document.getElementById('displayStudentName');
    const displayUsn = document.getElementById('displayUsn');
    const displayCourseName = document.getElementById('displayCourseName');
    const displayActivityName = document.getElementById('displayActivityName');
    const displayActivityDetails = document.getElementById('displayActivityDetails');
    const displayTotalHours = document.getElementById('displayTotalHours');
    const displayDuration = document.getElementById('displayDuration');
    const displayActivityPoints = document.getElementById('displayActivityPoints');
    const displayDate = document.getElementById('displayDate');

    // Generate Unique ID
    const generateId = () => `GECR-AICTE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    let currentCertId = generateId();
    const displayCertId = document.getElementById('displayCertId');
    if(displayCertId) displayCertId.innerText = currentCertId;

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
    bindInput(activityDetailsInput, displayActivityDetails);
    bindInput(totalHoursInput, displayTotalHours);
    bindInput(durationInput, displayDuration);
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
        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = 'Generating PDF...';
        downloadBtn.disabled = true;

        // Temporarily alter the DOM to ensure html2canvas captures the full unscaled element
        const appContainer = document.querySelector('.app-container');
        const previewPanel = document.querySelector('.preview-panel');
        const controlsPanel = document.querySelector('.controls-panel');
        
        // Save original styles
        const origBodyOverflow = document.body.style.overflow;
        const origAppOverflow = appContainer.style.overflow;
        const origPreviewOverflow = previewPanel.style.overflow;
        const origControlsDisplay = controlsPanel.style.display;
        
        // Apply temporary styles for pure rendering
        document.body.style.overflow = 'visible';
        appContainer.style.overflow = 'visible';
        previewPanel.style.overflow = 'visible';
        controlsPanel.style.display = 'none'; // Hide sidebar
        
        certificate.style.transform = 'none';
        certificate.style.position = 'relative';
        
        const opt = {
            margin:       0,
            filename:     `${studentNameInput.value.replace(/\s+/g, '_')}_AICTE_Certificate.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
            jsPDF:        { unit: 'px', format: [1123, 794], orientation: 'landscape', compress: true }
        };

        // Allow micro-task queue to flush so DOM computations finish
        setTimeout(() => {
            window.scrollTo(0, 0); // Ensure we capture from top
            html2pdf().set(opt).from(certificate).save().then(() => {
                // Save to localStorage 
                const records = JSON.parse(localStorage.getItem('aicte_certificates') || '[]');
                records.push({
                    id: currentCertId,
                    name: studentNameInput.value,
                    usn: usnInput.value,
                    course: courseNameInput.value,
                    activity: activityNameInput.value,
                    details: activityDetailsInput.value,
                    hours: totalHoursInput.value,
                    duration: durationInput.value,
                    points: activityPointsInput.value,
                    date: dateInput.value,
                    timestamp: new Date().toLocaleString()
                });
                localStorage.setItem('aicte_certificates', JSON.stringify(records));
                
                // Regenerate ID for the next potentially downloaded certificate
                currentCertId = generateId();
                if(displayCertId) displayCertId.innerText = currentCertId;

                // Restore all styles
                document.body.style.overflow = origBodyOverflow;
                appContainer.style.overflow = origAppOverflow;
                previewPanel.style.overflow = origPreviewOverflow;
                controlsPanel.style.display = origControlsDisplay;
                certificate.style.position = 'absolute';
                scaleCertificate(); // Re-apply original scale calculation
                
                downloadBtn.innerText = originalText;
                downloadBtn.disabled = false;
            }).catch(err => {
                console.error("PDF generation error: ", err);
                // Restore all styles on error too
                document.body.style.overflow = origBodyOverflow;
                appContainer.style.overflow = origAppOverflow;
                previewPanel.style.overflow = origPreviewOverflow;
                controlsPanel.style.display = origControlsDisplay;
                certificate.style.position = 'absolute';
                scaleCertificate();
                
                downloadBtn.innerText = 'Error Generating';
                setTimeout(() => {
                    downloadBtn.innerText = originalText;
                    downloadBtn.disabled = false;
                }, 3000);
            });
        }, 150);
    });
});
