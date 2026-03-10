import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/app/contexts/ToastContext';
import { useLocation } from 'wouter';

interface OtpVerificationProps {
    userId: string;
    email: string;
    onCancel: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ userId, email, onCancel }) => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { verifyMfa, resendMfa } = useAuth();
    const { showToast } = useToast();
    const [, setLocation] = useLocation();

    useEffect(() => {
        let timer: number;
        if (resendCooldown > 0) {
            timer = window.setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            showToast('Please enter a 6-digit code', 'error');
            return;
        }

        setIsVerifying(true);
        try {
            await verifyMfa(userId, otp);
            showToast('Login successful!', 'success');
            setLocation('/dashboard');
        } catch (error: any) {
            console.error('MFA Error:', error);
            // Error is handled/toasted by AuthContext
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await resendMfa(userId);
            setResendCooldown(30);
            showToast('New verification code sent', 'success');
        } catch (error) {
            // Error is handled by AuthContext
        }
    };

    return (
        <div className="w-full max-w-md animate-element animate-delay-100">
            <button
                onClick={onCancel}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Sign In</span>
            </button>

            <div className="flex flex-col gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white tracking-tighter">
                    Security Check
                </h1>

                <p className="text-muted-foreground">
                    We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>. Please enter it below to continue.
                </p>

                <form className="space-y-6" onSubmit={handleVerify}>
                    <div className="rounded-2xl border border-white/10 bg-secondary/30 backdrop-blur-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50">
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="0 0 0 0 0 0"
                                className="w-full bg-transparent text-2xl tracking-[0.5em] font-mono p-4 pl-12 rounded-2xl focus:outline-none text-white outline-none placeholder:tracking-normal placeholder:text-sm placeholder:font-sans"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying || otp.length !== 6}
                        className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isVerifying ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : 'Verify & Continue'}
                    </button>
                </form>

                <div className="flex flex-col items-center gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className="text-primary hover:underline text-sm font-medium disabled:text-muted-foreground transition-colors"
                    >
                        {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Request a new code'}
                    </button>
                </div>
            </div>
        </div>
    );
};
