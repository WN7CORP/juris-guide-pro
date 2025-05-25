
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  console.log('AuthGuard state:', { user: !!user, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando autenticação...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Show auth screen if no user is authenticated
  if (!user) {
    console.log('No user found, showing auth screen');
    return <AuthScreen />;
  }

  // User is authenticated, allow access
  console.log('User authenticated, allowing access');
  return <>{children}</>;
};
