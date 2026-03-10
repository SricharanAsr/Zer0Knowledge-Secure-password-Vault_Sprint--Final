import { useLocation } from 'wouter';
import { Suspense, lazy, useState } from 'react';
import { SignInPage, type Testimonial } from '@/app/components/ui/sign-in';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/app/contexts/ToastContext';
import { OtpVerification } from '@/app/components/ui/OtpVerification';

const Spline = lazy(() => import('@splinetool/react-spline'));

/** Component or function for Landing. */
export default function Landing() {
    const [, setLocation] = useLocation();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [mfaData, setMfaData] = useState<{ userId: string; email: string } | null>(null);

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            showToast('Signing in...', 'info');
            const result = await login(email, password);

            if (result && result.requiresMFA && result.userId && result.email) {
                setMfaData({ userId: result.userId, email: result.email });
                return;
            }

            showToast('Sign in successful!', 'success');
            setLocation('/dashboard');
        } catch (error: any) {
            showToast(error.message || 'Login failed', 'error');
        }
    };


    const sampleTestimonials: Testimonial[] = [
        {
            avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
            name: "Sarah Chen",
            handle: "@sarahdigital",
            text: "No more password panic. Zero-Vault delivers slick, secure password management everywhere."
        },
        {
            avatarSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80",
            name: "Marcus Johnson",
            handle: "@marcustech",
            text: "Flawless precision across all my devices. It's truly a zero-knowledge architecture I can trust."
        }
    ];

    // If we're in MFA mode, we show the MFA component inside our custom layout 
    // that matches SignInPage's structure to keep it smooth.
    if (mfaData) {
        return (
            <div className="h-[100dvh] w-[100dvw] bg-background relative overflow-hidden flex flex-col md:flex-row font-body">
                {/* Left column: MFA form */}
                <section className="flex-1 flex items-center justify-center p-8 bg-card relative z-20">
                    <OtpVerification
                        userId={mfaData.userId}
                        email={mfaData.email}
                        onCancel={() => setMfaData(null)}
                    />
                </section>

                {/* Right column: hero (reused from SignInPage logic) */}
                <section className="hidden md:block flex-1 relative overflow-hidden bg-background">
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div className="absolute -inset-y-[80px] -inset-x-[150px] pointer-events-auto">
                            <Suspense fallback={<div className="w-full h-full bg-black/50" />}>
                                <Spline scene="https://prod.spline.design/nyPq2v-2hiR8XXPp/scene.splinecode" />
                            </Suspense>
                        </div>
                        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                    </div>
                </section>
            </div>
        );
    }

    // Default: Show the standard sign-in page
    return (
        <SignInPage
            title={<span className="font-light text-foreground tracking-tighter">Welcome back</span>}
            description="Access your secure Zero-Vault and continue your journey"
            isSignUp={false}
            testimonials={sampleTestimonials}
            onSignIn={handleSignIn}
            onSwitchMode={() => setLocation('/register')}
            onResetPassword={() => { }}
            heroNode={
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -inset-y-[80px] -inset-x-[150px] pointer-events-auto">
                        <Suspense fallback={<div className="w-full h-full bg-black/50" />}>
                            <Spline scene="https://prod.spline.design/nyPq2v-2hiR8XXPp/scene.splinecode" />
                        </Suspense>
                    </div>
                    <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                </div>
            }
        />
    );
}
