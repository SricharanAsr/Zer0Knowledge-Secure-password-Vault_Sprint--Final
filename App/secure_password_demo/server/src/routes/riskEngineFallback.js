
// JavaScript Fallback/Mock for the Risk Engine Addon
// This is used when the native C++ addon cannot be compiled

const riskEngine = {
    evaluate: (signals) => {
        const { secure_boot, failed_login_count, device_trusted } = signals;

        // Simple logic mirrors the native C++ implementation
        // Increased threshold to 50 for demo purposes to avoid accidental lockouts
        if (failed_login_count > 50) return 'DENY';
        if (!secure_boot || !device_trusted) return 'STEP_UP';

        return 'ALLOW';
    },
    verifyAuditLog: () => {
        console.warn('verifyAuditLog: JS fallback used, always returning true');
        return true;
    }
};

module.exports = riskEngine;
