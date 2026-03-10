import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { sendOTPEmail } from './utils/emailService';

async function testEmail() {
    console.log('Testing Email Service...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);

    try {
        await sendOTPEmail('konduruhemesh778@gmail.com', '123456');
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Test email failed:', error);
    }
}

testEmail();
