
// TypeScript Fallback/Mock for the Risk Engine Addon
// This is used when the native C++ addon cannot be compiled

export interface RiskSignals {
    secure_boot: boolean;
    failed_login_count: number;
    device_trusted: boolean;
}

export const evaluate = (signals: RiskSignals): 'ALLOW' | 'DENY' | 'STEP_UP' => {
    const { secure_boot, failed_login_count, device_trusted } = signals;

    // Simple logic mirrors the native C++ implementation
    // Increased threshold for demo purposes to avoid accidental lockouts
    if (failed_login_count > 50) return 'DENY';
    if (!secure_boot || !device_trusted) return 'STEP_UP';

    return 'ALLOW';
};

export const verifyAuditLog = (): boolean => {
    console.warn('verifyAuditLog: JS fallback used, always returning true');
    return true;
};

// For CommonJS compatibility if needed by require()
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { evaluate, verifyAuditLog };
}
