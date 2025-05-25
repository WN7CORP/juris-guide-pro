
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Scale, UserPlus, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuthStore();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    category: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await signIn(loginData.email, loginData.password);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.category) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      await signUp(registerData.email, registerData.password, {
        name: registerData.name,
        category: registerData.category
      });
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-law-accent" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Códigos Jurídicos
          </h1>
          <p className="text-gray-400">
            Sua plataforma de estudos jurídicos
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-law-accent">Entrar na sua conta</CardTitle>
                <CardDescription>
                  Acesse sua conta para continuar estudando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-netflix-bg border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-netflix-bg border-gray-700"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/80"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-law-accent">Criar nova conta</CardTitle>
                <CardDescription>
                  Crie sua conta para acessar todas as funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-netflix-bg border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-netflix-bg border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-netflix-bg border-gray-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={registerData.category} 
                      onValueChange={(value) => setRegisterData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger className="bg-netflix-bg border-gray-700">
                        <SelectValue placeholder="Selecione sua categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concurseiro">Concurseiro</SelectItem>
                        <SelectItem value="estudante">Estudante</SelectItem>
                        <SelectItem value="advogado">Advogado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-law-accent hover:bg-law-accent/80"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
