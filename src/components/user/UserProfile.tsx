
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

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { profile, updateProfile, user, predefinedAvatars } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    console.log('UserProfile - Current state:', { user: !!user, profile: !!profile, open });
    
    if (open && profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || predefinedAvatars[0]);
    } else if (open && !profile && user) {
      setUsername(user.email?.split('@')[0] || '');
      setAvatarUrl(predefinedAvatars[0]);
    }
  }, [open, profile, user, predefinedAvatars]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('UserProfile - handleSave called with:', { user: !!user, username });
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      toast.error('Nome de usuário é obrigatório');
      return;
    }

    if (trimmedUsername.length < 3) {
      toast.error('Nome de usuário deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await updateProfile(trimmedUsername, avatarUrl || predefinedAvatars[0]);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error(error.message || 'Erro ao salvar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Configurar Perfil</DialogTitle>
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
              className="flex items-center gap-2 border-gray-600 hover:bg-gray-700"
            >
              <Shuffle className="w-4 h-4" />
              Escolher Avatar
            </Button>

            {/* Grid de avatares pré-definidos */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
              {predefinedAvatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatarUrl(avatar)}
                  className={`p-1 rounded-lg border-2 transition-all ${
                    avatarUrl === avatar 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback className="bg-gray-700">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="username" className="text-gray-300">Nome de Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
              minLength={3}
              className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-600 hover:bg-gray-700">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
