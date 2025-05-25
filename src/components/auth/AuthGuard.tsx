
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { useState, useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  console.log('AuthGuard: user:', !!user, 'profile:', !!profile, 'loading:', loading);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('AuthGuard: Timeout reached, stopping infinite loading');
      setTimeoutReached(true);
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Mostrar loading apenas se não atingiu timeout
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
          <p className="text-xs text-gray-500 mt-2">Configurando seu perfil...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário ou timeout foi atingido, mostrar tela de auth
  if (!user || timeoutReached) {
    console.log('AuthGuard: No user or timeout reached, showing AuthScreen');
    return <AuthScreen />;
  }

  // Se há usuário mas sem perfil, mostrar auth screen para configurar perfil
  if (user && !profile) {
    console.log('AuthGuard: User exists but no profile, showing AuthScreen for profile setup');
    return <AuthScreen />;
  }

  // Usuário e perfil existem, mostrar app
  console.log('AuthGuard: User and profile exist, showing app');
  return <>{children}</>;
};
