
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    console.log('AuthGuard state:', { user: !!user, profile: !!profile, loading });
  }, [user, profile, loading]);

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

  // Se não tem usuário, mostra a tela de login
  if (!user) {
    console.log('AuthGuard: No user, showing AuthScreen');
    return <AuthScreen />;
  }

  // Se tem usuário mas não tem perfil, mostra a tela de auth para configurar perfil
  if (user && !profile) {
    console.log('AuthGuard: User but no profile, showing AuthScreen for profile setup');
    return <AuthScreen />;
  }

  // Se tem usuário e perfil, mostra o conteúdo principal
  console.log('AuthGuard: User and profile found, showing main content');
  return <>{children}</>;
};
