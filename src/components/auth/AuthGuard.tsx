
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from './AuthScreen';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Database, ExternalLink } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'setup_required' | 'no_user' | 'user_no_profile' | 'authenticated' | 'error' | 'timeout';

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, profile, loading, error, setupRequired, retryLoadProfile, retrySetup } = useAuth();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [timeoutReached, setTimeoutReached] = useState(false);

  console.log('AuthGuard: user:', !!user, 'profile:', !!profile, 'loading:', loading, 'error:', error, 'setupRequired:', setupRequired);

  // Determinar estado da autenticação
  useEffect(() => {
    if (setupRequired) {
      console.log('AuthGuard: Setup required');
      setAuthState('setup_required');
      return;
    }

    if (error && !loading) {
      console.log('AuthGuard: Error state:', error);
      setAuthState('error');
      return;
    }

    if (loading && !timeoutReached) {
      setAuthState('loading');
      return;
    }

    if (!user || timeoutReached) {
      console.log('AuthGuard: No user or timeout reached');
      setAuthState('no_user');
      return;
    }

    if (user && !profile) {
      console.log('AuthGuard: User exists but no profile');
      setAuthState('user_no_profile');
      return;
    }

    if (user && profile) {
      console.log('AuthGuard: User and profile exist - authenticated');
      setAuthState('authenticated');
      return;
    }
  }, [user, profile, loading, error, setupRequired, timeoutReached]);

  // Timeout progressivo para evitar loading infinito
  useEffect(() => {
    if (!loading) {
      setTimeoutReached(false);
      return;
    }

    const timeouts = [
      setTimeout(() => {
        console.log('AuthGuard: 10 second timeout reached');
        if (loading && !setupRequired) {
          setTimeoutReached(true);
        }
      }, 10000),
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [loading, setupRequired]);

  // Setup required state
  if (authState === 'setup_required') {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center max-w-2xl bg-gray-800/50 border border-gray-700 rounded-lg p-8">
          <Database className="w-16 h-16 text-law-accent mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-white mb-4">Configuração do Banco de Dados Necessária</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            O banco de dados ainda não foi configurado. Para continuar, você precisa executar o script SQL no Supabase Dashboard.
          </p>
          
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-medium mb-2">Passos para configurar:</h3>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Acesse o Supabase Dashboard</li>
              <li>Vá para SQL Editor</li>
              <li>Execute o conteúdo do arquivo SUPABASE_SETUP_COMPLETE.sql</li>
              <li>Clique em "Tentar Novamente" abaixo</li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={retrySetup}
              className="w-full bg-law-accent hover:bg-law-accent/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Supabase Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">Carregando...</p>
          <p className="text-xs text-gray-500">Configurando seu acesso...</p>
          
          {/* Progress indicator */}
          <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
            <div className="bg-law-accent h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Timeout warning */}
          <p className="text-xs text-gray-600 mt-4">
            Se o carregamento demorar muito, a tela será redirecionada automaticamente
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (authState === 'error') {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center max-w-md bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erro na Autenticação</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          
          <div className="space-y-2">
            <Button 
              onClick={retryLoadProfile}
              className="w-full bg-law-accent hover:bg-law-accent/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Recarregar Página
            </Button>
          </div>
          
          {error?.includes('user_profiles') && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-300">
              <strong>Dica:</strong> Execute o SQL de setup no Supabase Dashboard
            </div>
          )}
        </div>
      </div>
    );
  }

  // No user or timeout - show auth screen
  if (authState === 'no_user' || authState === 'timeout') {
    console.log('AuthGuard: Showing AuthScreen');
    return <AuthScreen />;
  }

  // User without profile - show auth screen with profile setup
  if (authState === 'user_no_profile') {
    console.log('AuthGuard: Showing AuthScreen for profile setup');
    return <AuthScreen />;
  }

  // Authenticated - show app
  console.log('AuthGuard: User and profile exist, showing app');
  return <>{children}</>;
};
