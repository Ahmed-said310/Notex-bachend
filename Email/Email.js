const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
exports.sendPasswordResetEmail = async (email, resetLink) => {
    const Link = `${process.env.CLIENT_URL}/reset-password/${resetLink}`;

    const Html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
            .header { text-align: center; padding-bottom: 20px; }
            .logo { color: #2563eb; font-size: 28px; font-weight: bold; text-decoration: none; }
            .content { padding: 20px; background-color: #ffffff; border-radius: 8px; text-align: center; }
            .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
            .button { display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 25px; }
            .warning { font-size: 13px; color: #6b7280; margin-top: 20px; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Notex</div>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset the password for your Notex account. No changes have been made yet.</p>
                <p>Click the button below to choose a new password. <strong>This link will expire in 1 hour.</strong></p>
                
                <a href="${Link}" class="button">Reset Password</a>

                <p class="warning">If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Notex Inc. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"Notex Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset your Notex Password',
        html: Html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};