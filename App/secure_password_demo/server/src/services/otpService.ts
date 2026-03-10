import bcrypt from 'bcryptjs';
import { supabase } from '../storage/supabaseClient';

export class OtpService {
    /**
     * Generates a random 6-digit OTP code.
     */
    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Hashes an OTP code using bcrypt.
     */
    static async hashOTP(otp: string): Promise<string> {
        return await bcrypt.hash(otp, 10);
    }

    /**
     * Stores a hashed OTP in the database with an expiry time.
     */
    static async storeOTP(userId: string, otpHash: string): Promise<void> {
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

        // Delete any existing OTPs for the user first
        await supabase.from('mfa_otps').delete().eq('user_id', userId);

        const { error } = await supabase
            .from('mfa_otps')
            .insert([{
                user_id: userId,
                otp_hash: otpHash,
                expires_at: expiresAt
            }]);

        if (error) {
            console.error('Error storing OTP:', error);
            throw new Error('Could not store OTP');
        }
    }

    /**
     * Verifies if the provided OTP matches the stored hash for a user.
     */
    static async verifyOTP(userId: string, otp: string): Promise<boolean> {
        const { data: mfaData, error } = await supabase
            .from('mfa_otps')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !mfaData) {
            return false;
        }

        if (mfaData.attempts >= 5) {
            throw new Error('Too many failed attempts');
        }

        const isMatch = await bcrypt.compare(otp, mfaData.otp_hash);

        if (!isMatch) {
            // Increment attempts
            await supabase
                .from('mfa_otps')
                .update({ attempts: (mfaData.attempts || 0) + 1 })
                .eq('id', mfaData.id);
            return false;
        }

        return true;
    }

    /**
     * Deletes the OTP record for a user after successful verification.
     */
    static async invalidateOTP(userId: string): Promise<void> {
        await supabase.from('mfa_otps').delete().eq('user_id', userId);
    }
}
