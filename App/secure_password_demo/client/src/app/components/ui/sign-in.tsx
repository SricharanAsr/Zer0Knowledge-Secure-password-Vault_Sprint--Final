import React, { useState } from 'react';
import { EyeToggleIcon } from './animated-state-icons';

// --- HELPER COMPONENTS (ICONS) ---

// --- TYPE DEFINITIONS ---

/** Interface defining the structure for Testimonial. */
export interface Testimonial {
    avatarSrc: string;
    name: string;
    handle: string;
    text: string;
}

interface SignInPageProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    heroImageSrc?: string;
    heroNode?: React.ReactNode; // Added to support the 3D Spline model natively
    testimonials?: Testimonial[];
    isSignUp?: boolean; // Toggles submit text and footer logic
    onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
    onResetPassword?: () => void;
    onSwitchMode?: () => void; // Switched from onCreateAccount to toggle between login and sign up
    children?: React.ReactNode;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    // Changed violet colors to primary colors for seamless theme integration
    <div className="rounded-2xl border border-white/10 bg-secondary/30 backdrop-blur-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50">
        {children}
    </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
    <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
        <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
        <div className="text-sm leading-snug">
            <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
            <p className="text-primary">{testimonial.handle}</p>
            <p className="mt-1 text-zinc-400">{testimonial.text}</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

/** Component or function for Sign In Page. */
export const SignInPage: React.FC<SignInPageProps> = ({
    title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
    description = "Access your account and continue your journey with us",
    heroImageSrc,
    heroNode,
    testimonials = [],
    isSignUp = false,
    onSignIn,
    onResetPassword,
    onSwitchMode,
    children,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-[100dvh] flex flex-col md:flex-row font-body w-[100dvw] bg-background">
            {/* Left column: sign-in form */}
            <section className="flex-1 flex items-center justify-center p-8 bg-card relative z-20">
                <div className="w-full max-w-md">
                    {children ? children : (
                        <div className="flex flex-col gap-6">
                            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-white">{title}</h1>
                            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

                            <form className="space-y-5" onSubmit={onSignIn}>
                                {isSignUp && (
                                    <div className="animate-element animate-delay-250">
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Display Name</label>
                                        <GlassInputWrapper>
                                            <input name="displayName" type="text" placeholder="Enter your display name" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white outline-none" required />
                                        </GlassInputWrapper>
                                    </div>
                                )}

                                <div className="animate-element animate-delay-300">
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Email Address</label>
                                    <GlassInputWrapper>
                                        <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white outline-none" required />
                                    </GlassInputWrapper>
                                </div>

                                <div className="animate-element animate-delay-400">
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Password</label>
                                    <GlassInputWrapper>
                                        <div className="relative">
                                            <input name="password" minLength={isSignUp ? 8 : 1} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white outline-none" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center group">
                                                <EyeToggleIcon isHidden={!showPassword} className="text-muted-foreground group-hover:text-white transition-colors" size={20} />
                                            </button>
                                        </div>
                                    </GlassInputWrapper>
                                </div>

                                {!isSignUp && (
                                    <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="rememberMe" className="custom-checkbox w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary accent-primary" />
                                            <span className="text-muted-foreground">Keep me signed in</span>
                                        </label>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-primary transition-colors">Reset password</a>
                                    </div>
                                )}

                                <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </button>
                            </form>

                            <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
                                {isSignUp ? "Already have an account?" : "New to our platform?"} <a href="#" onClick={(e) => { e.preventDefault(); onSwitchMode?.(); }} className="text-primary hover:underline transition-colors">{isSignUp ? 'Sign In' : 'Create Account'}</a>
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Right column: hero image / 3D Node + testimonials */}
            {heroNode || heroImageSrc ? (
                <section className="hidden md:block flex-1 relative overflow-hidden bg-background">
                    <div className="animate-slide-right animate-delay-300 absolute inset-0 z-0">
                        {heroNode ? heroNode : <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>}
                        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                    </div>

                    <div className="relative z-20 h-full w-full pointer-events-none">
                        {testimonials.length > 0 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center pointer-events-auto">
                                <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                                {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
                                {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
                            </div>
                        )}
                    </div>
                </section>
            ) : null}
        </div>
    );
};
