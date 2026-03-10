import nodemailer from 'nodemailer';

console.log('Initializing Email Service...');
console.log('ENV Check - Host:', !!process.env.EMAIL_HOST, 'User:', !!process.env.EMAIL_USER, 'Pass:', !!process.env.EMAIL_PASS);

const isGmail = (process.env.EMAIL_HOST || '').includes('gmail.com') || !process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT || '587');
const isSecure = port === 465;

// Build SMTP configuration
const transportConfig: any = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
};

if (isGmail && isSecure) {
    transportConfig.service = 'gmail';
}

const transporter = nodemailer.createTransport(transportConfig);

// Verify SMTP connection (only if breathing room exists)
if (!process.env.BREVO_API_KEY) {
    transporter.verify((error) => {
        if (error) {
            console.warn('SMTP Connection Error (Expect this on Render Free Tier):', error.message);
        } else {
            console.log(`SMTP Connection READY (Port: ${port})`);
        }
    });
}

/**
 * Sends a 6-digit verification code to the user's email.
 * Supports both SMTP and Brevo HTTP API (to bypass Render port blocks).
 */
export const sendOTPEmail = async (to: string, otp: string) => {
    const subject = 'ZeroVault Login Verification Code';
    const text = `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`;
    const html = `
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
    `;

    // FALLBACK: Use Brevo HTTP API if API key is provided (Recommended for Render Free Tier)
    if (process.env.BREVO_API_KEY) {
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: "ZeroVault",
                        email: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                    },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Brevo API error');
            }

            console.log(`Email successfully sent to ${to} via Brevo HTTP API`);
            return;
        } catch (apiError) {
            console.error('Brevo API Error:', apiError);
            // Don't throw yet, try falling back to SMTP just in case
        }
    }

    // DEFAULT: Traditional SMTP
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${to} via SMTP`);
    } catch (error) {
        console.error('Error sending email via SMTP:', error);
        throw new Error('Failed to send verification email. Port blocking likely detected.');
    }
};
