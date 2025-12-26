// Real email endpoint (using nodemailer or service)
const nodemailer = require('nodemailer');

app.post('/api/send-real-email', async (req, res) => {
    const { to, subject, body } = req.body;
    
    // Create transporter (configure with your email)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: body
        });
        
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Add to server-enhanced.js
app.post('/api/schedule-meeting', async (req, res) => {
    const { title, date, time, participants } = req.body;
    
    // Create Google Calendar or Outlook meeting link
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}T${time}00/${date}T${parseInt(time)+1}0000&details=Meeting scheduled via AI Talent CRM&add=${participants.join(',')}`;
    
    res.json({
        success: true,
        calendarLinks: {
            google: googleCalendarLink,
            outlook: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${date}T${time}00&enddt=${date}T${parseInt(time)+1}0000`,
            ical: `/api/meeting/ical?title=${encodeURIComponent(title)}&date=${date}&time=${time}`
        },
        message: 'Use the links above to add to calendar'
    });
});