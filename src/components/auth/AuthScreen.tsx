import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/user/UserProfile';
import { toast } from 'sonner';
import { Loader2, Scale, Book, Users, MessageSquare } from 'lucide-react';

export const AuthScreen = () => {
  const { signUp, signIn, user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Se o usuário logou mas não tem perfil, mostra automaticamente o modal de perfil
  useEffect(() => {
    console.log('AuthScreen useEffect:', { user: !!user, profile: !!profile, showProfile });
    
    if (user && !profile && !showProfile) {
      console.log('AuthScreen: Setting showProfile to true');
      setShowProfile(true);
    }
  }, [user, profile, showProfile]);

  // Se usuário logou e tem perfil, não mostrar mais esta tela
  if (user && profile) {
    console.log('AuthScreen: User and profile exist, should not render');
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      toast.error('Erro ao criar conta: ' + error.message);
    } else {
      toast.success('Conta criada! Agora configure seu perfil.');
      setShowProfile(true);
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Erro ao fazer login: ' + error.message);
    } else {
      toast.success('Login realizado com sucesso!');
    }
    setLoading(false);
  };

  const handleProfileClose = (open: boolean) => {
    console.log('AuthScreen: handleProfileClose called with:', open);
    
    if (!open && !profile) {
      // Se fechar sem criar perfil, manter showProfile como false
      console.log('AuthScreen: Closing profile modal without creating profile');
      setShowProfile(false);
    } else {
      setShowProfile(open);
    }
  };

  // Se tem usuário mas precisa configurar perfil
  if (user && (showProfile || !profile)) {
    console.log('AuthScreen: Showing UserProfile modal');
    return (
      <UserProfile 
        open={true} 
        onOpenChange={handleProfileClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-netflix-bg via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <Scale className="w-10 h-10 text-law-accent" />
            <h1 className="text-3xl font-bold text-white">Vade Mecum Digital</h1>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Acesse o maior
            <span className="text-law-accent"> repositório jurídico</span> 
            do Brasil
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Consulte códigos, leis e estatutos com comentários da comunidade jurídica. 
            Participe das discussões e aprofunde seu conhecimento.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="flex items-center gap-3 text-gray-300">
              <Book className="w-5 h-5 text-law-accent" />
              <span className="text-sm">+50 Códigos</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="w-5 h-5 text-law-accent" />
              <span className="text-sm">Comunidade Ativa</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MessageSquare className="w-5 h-5 text-law-accent" />
              <span className="text-sm">Análises Exclusivas</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="w-full bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-gray-400">
              Entre ou crie sua conta para acessar o conteúdo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                <TabsTrigger value="signin" className="data-[state=active]:bg-law-accent">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-law-accent">
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-600 text-white focus:border-law-accent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password" className="text-gray-300">
                      Senha
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-600 text-white focus:border-law-accent"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/90" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-600 text-white focus:border-law-accent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password" className="text-gray-300">
                      Senha
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-600 text-white focus:border-law-accent"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password" className="text-gray-300">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-600 text-white focus:border-law-accent"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/90" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
