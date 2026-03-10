import express, { Request, Response } from 'express';
// Import the compiled Risk Engine Addon with JS fallback
let riskEngine: any;
try {
    riskEngine = require('../../build/Release/risk_engine');
} catch (e) {
    console.warn('Native Risk Engine not found in security.ts, using JS fallback');
    riskEngine = require('./riskEngineFallback');
}

const router = express.Router();

/**
 * GET /api/security/audit/verify
 * Admin endpoint to verify the tamper-evident hash chain of the Risk Engine's log.
 */
router.get('/audit/verify', (req: Request, res: Response) => {
    try {
        const isValid = riskEngine.verifyAuditLog();
        if (isValid) {
            res.json({ success: true, message: 'Audit log chain verified successfully.' });
        } else {
            // Note: Returning 500 or 400 depending on security policy. 500 for internal error/tampering.
            res.status(500).json({ success: false, error: 'Audit log chain verification failed. Tampering detected or log missing.' });
        }
    } catch (error) {
        console.error('Audit verification error:', error);
        res.status(500).json({ success: false, error: 'Server error during audit verification.' });
    }
});

export default router;
