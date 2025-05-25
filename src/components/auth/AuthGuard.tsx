
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    console.log('AuthGuard state:', { user: !!user, profile: !!profile, loading, forceRefresh });
  }, [user, profile, loading, forceRefresh]);

  // Force refresh when profile is updated
  useEffect(() => {
    if (user && profile) {
      console.log('AuthGuard: User and profile detected, forcing refresh');
      setForceRefresh(prev => prev + 1);
    }
  }, [user, profile]);

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

  // Se tem usuário e perfil, mostra o conteúdo
  console.log('AuthGuard: User and profile found, showing main content');
  return <>{children}</>;
};
