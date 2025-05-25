
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, User, Shuffle } from 'lucide-react';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=fde2e4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=f0f9ff',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1&backgroundColor=ddd6fe',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2&backgroundColor=fed7d7',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3&backgroundColor=d4edda',
];

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { profile, updateProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    console.log('UserProfile: Dialog opened, profile exists:', !!profile);
    
    if (open && profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || predefinedAvatars[0]);
    } else if (open && !profile && user) {
      const emailUsername = user.email?.split('@')[0] || 'user';
      const safeUsername = emailUsername.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'user';
      setUsername(safeUsername);
      setAvatarUrl(predefinedAvatars[0]);
    }
  }, [open, profile, user]);

  const validateUsername = (username: string): string | null => {
    const trimmed = username.trim();
    
    if (!trimmed) {
      return 'Nome de usuário é obrigatório';
    }
    
    if (trimmed.length < 3) {
      return 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    
    if (trimmed.length > 30) {
      return 'Nome de usuário deve ter no máximo 30 caracteres';
    }
    
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmed)) {
      return 'Nome de usuário pode conter apenas letras, números, _ e -';
    }
    
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para atualizar o perfil');
      return;
    }

    const validationError = validateUsername(username);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const trimmedUsername = username.trim();
    setLoading(true);
    
    try {
      console.log('UserProfile: Saving profile with username:', trimmedUsername);
      const { error } = await updateProfile(trimmedUsername, avatarUrl || predefinedAvatars[0]);
      
      if (error) {
        console.error('UserProfile: Error updating profile:', error);
        toast.error(error.message);
      } else {
        console.log('UserProfile: Profile saved successfully');
        toast.success('Perfil atualizado com sucesso!');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('UserProfile: Unexpected error:', error);
      toast.error('Erro inesperado ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const selectRandomAvatar = () => {
    const randomAvatar = predefinedAvatars[Math.floor(Math.random() * predefinedAvatars.length)];
    setAvatarUrl(randomAvatar);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {profile ? 'Editar Perfil' : 'Configurar Perfil'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={selectRandomAvatar}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Avatar Aleatório
            </Button>

            <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
              {predefinedAvatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatarUrl(avatar)}
                  className={`p-1 rounded-lg border-2 transition-all ${
                    avatarUrl === avatar 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback className="bg-gray-100">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="username" className="text-gray-700">Nome de Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
              minLength={3}
              maxLength={30}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              3-30 caracteres, apenas letras, números, _ e -
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {profile ? 'Atualizar' : 'Criar Perfil'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
