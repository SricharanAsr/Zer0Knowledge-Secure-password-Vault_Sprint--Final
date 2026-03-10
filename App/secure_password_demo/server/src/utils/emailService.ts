import nodemailer from 'nodemailer';

console.log('Initializing Email Service...');
console.log('ENV Check - Host:', !!process.env.EMAIL_HOST, 'User:', !!process.env.EMAIL_USER, 'Pass:', !!process.env.EMAIL_PASS);

const isGmail = (process.env.EMAIL_HOST || '').includes('gmail.com') || !process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT || '587');
const isSecure = port === 465;

// Build configuration
const transportConfig: any = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Force IPv4 as cloud providers like Render often have issues with IPv6 SMTP routes
    family: 4,
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000, // Increase slightly for cloud networks
    greetingTimeout: 15000,
    socketTimeout: 20000
};

// If using Gmail service defaults on port 465
if (isGmail && isSecure) {
    transportConfig.service = 'gmail';
}

const transporter = nodemailer.createTransport(transportConfig);

// Verify connection on startup to log status in Render/Production
transporter.verify((error) => {
    if (error) {
        console.error('Email Service SMTP Connection Error:', {
            message: error.message,
            code: (error as any).code,
            command: (error as any).command,
            port: port,
            secure: isSecure
        });
    } else {
        console.log(`Email Service SMTP Connection: READY (Port: ${port}, Secure: ${isSecure}, IPv4: Forced)`);
    }
});

/**
 * Sends a 6-digit verification code to the user's email.
 * @param to - Recipient email address
 * @param otp - 6-digit OTP code
 */
export const sendOTPEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'ZeroVault Login Verification Code',
        text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #10b981; text-align: center;">ZeroVault Login Verification Code</h2>
                <p style="font-size: 16px; color: #475569;">Your verification code is:</p>
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
