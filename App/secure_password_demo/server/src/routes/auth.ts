import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../storage/supabaseClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendOTPEmail } from '../utils/emailService';
import crypto from 'crypto';

import * as fallbackEngine from "./riskEngineFallback";

// Robust loading of Risk Engine (Native with JS Fallback)
let riskEngine: any;
try {
    // Attempt to load native addon
    riskEngine = require('../../build/Release/risk_engine');
    console.log('Successfully loaded native Risk Engine');
} catch (e) {
    console.warn('Native Risk Engine not found, using TypeScript fallback');
    riskEngine = fallbackEngine;
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, displayName } = req.body;
        console.log('Registration request:', { email, displayName, password: '***' });

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ email, password_hash: hashedPassword }])
            .select()
            .single();

        if (error || !user) throw error;

        // Initialize sync state for the user
        await supabase.from('user_sync_state').insert([{ user_id: user.id }]);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, displayName }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error', details: error.message || error });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', { email, password: '***' });

        // Fetch user first to get real signal data like failed_login_count
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        // Collect signals for the Risk Engine Mapper dynamically
        // Since browsers don't natively send device attestations, default to true unless explicitly provided
        const signals = {
            secure_boot: req.headers['x-secure-boot'] ? req.headers['x-secure-boot'] === '1' : true,
            failed_login_count: user ? (user.login_count || 0) : 0,
            device_trusted: req.headers['x-device-trusted'] ? req.headers['x-device-trusted'] === 'true' : true
        };

        const decision = riskEngine.evaluate(signals);

        // Structured Logging for forensic audit and security monitoring
        console.log(JSON.stringify({
            event: "risk_evaluation",
            user: email,
            decision,
            signals
        }));

        if (decision === 'DENY') {
            return res.status(403).json({ error: 'Access denied by security policy' });
        }
        if (decision === 'STEP_UP') {
            // Trigger MFA Flow (In this demo, we return 401 with requiresMFA flag)
            return res.status(401).json({ error: 'MFA required', requiresMFA: true, stepUp: true });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // --- MFA Flow Initialization ---
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

        const { error: otpError } = await supabase
            .from('mfa_otps')
            .insert([{
                user_id: user.id,
                otp_hash: otpHash,
                expires_at: expiresAt
            }]);

        if (otpError) {
            console.error('Failed to store OTP:', otpError);
            return res.status(500).json({ error: 'Failed to initialize security challenge' });
        }

        try {
            await sendOTPEmail(email, otp);
        } catch (mailErr) {
            console.error('MFA Email Error:', mailErr);
            return res.status(500).json({ error: 'Failed to send verification email' });
        }

        return res.json({
            requiresMFA: true,
            userId: user.id,
            email: user.email
        });
        // -------------------------------
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/verify-mfa
router.post('/verify-mfa', async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        // Fetch valid OTP
        const { data: mfaData, error: fetchError } = await supabase
            .from('mfa_otps')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (fetchError || !mfaData) {
            return res.status(401).json({ error: 'Invalid or expired verification code' });
        }

        if (mfaData.attempts >= 5) {
            return res.status(403).json({ error: 'Too many failed attempts. Please login again.' });
        }

        if (mfaData.otp_hash !== otpHash) {
            // Increment attempts
            await supabase
                .from('mfa_otps')
                .update({ attempts: (mfaData.attempts || 0) + 1 })
                .eq('id', mfaData.id);

            return res.status(401).json({ error: 'Invalid verification code' });
        }

        // Success! Clean up used OTP
        await supabase.from('mfa_otps').delete().eq('user_id', userId);

        // Fetch full user data to issue token
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Update login stats
        await supabase
            .from('users')
            .update({
                last_login_at: new Date().toISOString(),
                login_count: (user.login_count || 0) + 1
            })
            .eq('id', user.id);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
                lastLoginAt: new Date().toISOString(),
                loginCount: (user.login_count || 0) + 1
            }
        });
    } catch (error) {
        console.error('MFA Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/resend-mfa
router.post('/resend-mfa', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Fetch user email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Delete old OTPs and insert new one
        await supabase.from('mfa_otps').delete().eq('user_id', userId);
        const { error: otpError } = await supabase
            .from('mfa_otps')
            .insert([{ user_id: userId, otp_hash: otpHash, expires_at: expiresAt }]);

        if (otpError) {
            return res.status(500).json({ error: 'Failed to generate new code' });
        }

        await sendOTPEmail(user.email, otp);
        res.json({ success: true, message: 'New verification code sent' });
    } catch (error) {
        console.error('MFA Resend error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('id, email, created_at, last_login_at, login_count')
            .eq('id', req.userId)
            .single();

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at,
            loginCount: user.login_count
        });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
