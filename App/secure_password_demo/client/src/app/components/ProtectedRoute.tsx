import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/app/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute component that guards access to authenticated pages.
 * If the user is authenticated, it renders the children.
 * If the user is unauthenticated, it redirects them to the landing page.
 * While checking authentication, it shows a loading spinner.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setLocation('/');
        }
    }, [isLoading, isAuthenticated, setLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Checking security session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Return null while redirecting to avoid flickering protected content
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
