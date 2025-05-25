
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();

  console.log('AuthGuard state:', { user: !!user, profile: !!profile, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando perfil...</p>
          <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, allow access even if profile is temporarily missing
  if (!user) {
    return <AuthScreen />;
  }

  // Allow access if user exists, even if profile is still being created
  return <>{children}</>;
};
