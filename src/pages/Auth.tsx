import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Scale, Eye, EyeOff, Bookmark } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro inesperado durante o login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Conta criada com sucesso! Verifique seu email se necessário.');
    } catch (error) {
      toast.error('Erro inesperado durante o cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-netflix-dark border-gray-800 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Scale className="h-10 w-10 text-law-accent" />
              <span className="text-3xl font-serif font-bold text-law-accent">JurisGuide</span>
            </div>
            <CardTitle className="text-white text-xl">Acesse sua conta</CardTitle>
            <CardDescription className="text-gray-400">
              Entre ou crie sua conta para acessar todos os recursos do app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="data-[state=active]:bg-law-accent">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-law-accent">
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signin-email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-800 border-gray-700 text-white focus:border-law-accent focus:ring-law-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signin-password" className="block text-sm font-medium text-gray-300">
                      Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        required
                        className="bg-gray-800 border-gray-700 text-white focus:border-law-accent focus:ring-law-accent pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/80 text-white font-medium py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="block text-sm font-medium text-gray-300">
                      Nome de usuário
                    </label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Seu nome"
                      className="bg-gray-800 border-gray-700 text-white focus:border-law-accent focus:ring-law-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-800 border-gray-700 text-white focus:border-law-accent focus:ring-law-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">
                      Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="bg-gray-800 border-gray-700 text-white focus:border-law-accent focus:ring-law-accent pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/80 text-white font-medium py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Features Preview */}
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm mb-4">Acesse todos os recursos:</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <Scale className="h-5 w-5 mx-auto mb-2 text-law-accent" />
              <p>Códigos Legais</p>
            </div>
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <Bookmark className="h-5 w-5 mx-auto mb-2 text-law-accent" />
              <p>Favoritos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
