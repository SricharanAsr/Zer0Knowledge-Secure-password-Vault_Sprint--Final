import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Debug: Verify SMTP config (hidden in production)
if (process.env.NODE_ENV !== 'production') {
    transporter.verify((error) => {
        if (error) {
            console.error('SMTP Connection Error:', error);
        } else {
            console.log('Email Service: SMTP Connection Ready');
        }
    });
}

/**
 * Sends a 6-digit verification code to the user's email.
 * @param to - Recipient email address
 * @param otp - 6-digit OTP code
 */
export const sendOTPEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Secure Password Manager Login Verification',
        text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes. If you did not request this, please secure your account immediately.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #6366f1; text-align: center;">Zero Vault Login Verification</h2>
                <p style="font-size: 16px; color: #475569;">Hello,</p>
                <p style="font-size: 16px; color: #475569;">Your verification code for logging into <strong>Zero Vault</strong> is:</p>
                <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #64748b;">This code expires in <strong>5 minutes</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this code, please change your password immediately.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email successfully sent to ${to}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send verification email. Please try again later.');
    }
};
