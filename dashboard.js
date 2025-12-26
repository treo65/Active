// In your dashboard JS file
function sendRealEmail(candidate) {
    const subject = `Regarding your application - ${candidate.name}`;
    const body = `Dear ${candidate.name},\n\nThank you for your application. We would like to schedule an interview with you.\n\nBest regards,\nTalent CRM Team`;
    
    // Open default email client
    window.location.href = `mailto:${candidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}