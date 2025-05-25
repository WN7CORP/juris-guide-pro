
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, UserProfile } from '@/store/authStore';
import { toast } from 'sonner';
import { Scale, User, GraduationCap, Briefcase, Crown, Users } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileTypes = [
  { value: 'student', label: 'Estudante', icon: GraduationCap },
  { value: 'lawyer', label: 'Advogado(a)', icon: Briefcase },
  { value: 'judge', label: 'Magistrado(a)', icon: Scale },
  { value: 'professor', label: 'Professor(a)', icon: Crown },
  { value: 'citizen', label: 'Cidadão', icon: Users }
];

const avatars = [
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚖️', '👩‍⚖️', 
  '👨‍🏫', '👩‍🏫', '👤', '👥', '⚖️', '📚'
];

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profileType: '',
    avatar: ''
  });
  const { login } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && (!formData.profileType || !formData.avatar)) {
      toast.error('Por favor, selecione um perfil e avatar');
      return;
    }

    const user: UserProfile = {
      id: `user_${Date.now()}`,
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      avatar: formData.avatar || '👤',
      profileType: (formData.profileType || 'citizen') as UserProfile['profileType'],
      createdAt: new Date()
    };

    login(user);
    toast.success(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
    onOpenChange(false);
    setFormData({ name: '', email: '', password: '', profileType: '', avatar: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-netflix-dark border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-law-accent">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="Seu nome completo"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-gray-800 border-gray-700"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="bg-gray-800 border-gray-700"
              placeholder="Sua senha"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <Label>Perfil</Label>
                <Select value={formData.profileType} onValueChange={(value) => setFormData(prev => ({ ...prev, profileType: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {profileTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Avatar</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`p-2 text-2xl rounded border transition-colors ${
                        formData.avatar === avatar 
                          ? 'border-law-accent bg-law-accent/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-law-accent hover:bg-law-accent/90">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-law-accent hover:underline"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
