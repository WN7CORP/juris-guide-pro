
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();

  console.log('AuthGuard: user:', !!user, 'profile:', !!profile, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // If no user, show auth screen
  if (!user) {
    console.log('AuthGuard: No user, showing AuthScreen');
    return <AuthScreen />;
  }

  // If user exists but no profile, show auth screen (will handle profile creation)
  if (!profile) {
    console.log('AuthGuard: User exists but no profile, showing AuthScreen');
    return <AuthScreen />;
  }

  // User and profile both exist, show the app
  console.log('AuthGuard: User and profile exist, showing app');
  return <>{children}</>;
};
