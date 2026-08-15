const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
  family: 4,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
});

exports.sendWelcomeEmail = async (email, name) => {
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASS);
    const Html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
            .header { text-align: center; padding-bottom: 20px; }
            .logo { color: #2563eb; font-size: 28px; font-weight: bold; text-decoration: none; }
            .content { padding: 20px; background-color: #f9fafb; border-radius: 8px; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="#" class="logo">Notex</a>
            </div>
            <div class="content">
                <h2>Welcome, ${name}! 👋</h2>
                <p>Thank you for signing up for <strong>Notex</strong>—the ultimate space to capture your thoughts, ideas, and deep descriptions clearly and efficiently.</p>
                <p>Notex is built to help you document what matters without the clutter of traditional to-do lists. Just pure notes and rich content.</p>
                <a href="${process.env.CLIENT_URL}" class="button" style="color: white;">Start Writing</a>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Notex Inc. All rights reserved.</p>
                <p>If you did not create an account, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"Notex Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Notex - Start Capturing Your Thoughts',
        html: Html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
exports.sendPasswordResetEmail = async (email, resetToken) => {
    const fullResetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
                // Note: Google Apps Script Web App handles raw text/JSON payloads best
            },
            body: JSON.stringify({
                email: email,
                resetLink: fullResetLink
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            console.log('Password reset email sent successfully to:', email);
        } else {
            console.error('Google Apps Script Error:', result.message);
        }
    } catch (error) {
        console.error('Error triggering Google Apps Script:', error.message);
    }
};