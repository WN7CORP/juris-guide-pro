
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, User } from 'lucide-react';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const legalAvatars = [
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=judge&backgroundColor=e3f2fd&clothesType=blazerSweater&clothesColor=262e33&hairColor=2c1b18&skinColor=f8d25c',
    title: 'Juiz(a)'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lawyer&backgroundColor=f3e5f5&clothesType=shirtCrewNeck&clothesColor=262e33&hairColor=724133&skinColor=d08b5b',
    title: 'Advogado(a)'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prosecutor&backgroundColor=e8f5e8&clothesType=blazerShirt&clothesColor=3c4142&hairColor=a55728&skinColor=ae5d29',
    title: 'Promotor(a)'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=defender&backgroundColor=fff3e0&clothesType=shirtScoopNeck&clothesColor=262e33&hairColor=4a312c&skinColor=614335',
    title: 'Defensor(a)'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attorney&backgroundColor=fce4ec&clothesType=blazerSweater&clothesColor=3c4142&hairColor=2c1b18&skinColor=fdbcb4',
    title: 'Procurador(a)'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=notary&backgroundColor=e1f5fe&clothesType=shirtCrewNeck&clothesColor=5199e4&hairColor=724133&skinColor=edb98a',
    title: 'Notário'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student&backgroundColor=f9fbe7&clothesType=hoodie&clothesColor=262e33&hairColor=c93305&skinColor=f8d25c',
    title: 'Estudante'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professor&backgroundColor=ede7f6&clothesType=shirtVNeck&clothesColor=3c4142&hairColor=65c9ff&skinColor=d08b5b',
    title: 'Professor(a)'
  },
];

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { profile, updateProfile, user, loadUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (open && profile) {
      console.log('Loading profile data:', profile);
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || legalAvatars[0].url);
    } else if (open && !profile && user) {
      console.log('Creating default profile for user:', user.email);
      setUsername(user.email?.split('@')[0] || '');
      setAvatarUrl(legalAvatars[0].url);
    }
  }, [open, profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const trimmedUsername = username.trim();
    
    if (!trimmedUsername || trimmedUsername.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Updating profile with:', { username: trimmedUsername, avatarUrl });
      
      const { error } = await updateProfile(trimmedUsername, avatarUrl);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error(error.message || 'Erro ao salvar perfil');
      } else {
        console.log('Profile updated successfully');
        
        // Recarregar o perfil para garantir que está atualizado
        if (user.id) {
          await loadUserProfile(user.id);
        }
        
        toast.success('Perfil atualizado!');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Principal */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20 border-2 border-gray-200">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Grid de Avatares */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Escolha seu avatar</Label>
            
            <div className="grid grid-cols-4 gap-2">
              {legalAvatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    console.log('Selected avatar:', avatar.url);
                    setAvatarUrl(avatar.url);
                  }}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    avatarUrl === avatar.url 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Avatar className="w-10 h-10 mx-auto">
                    <AvatarImage src={avatar.url} alt={avatar.title} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-[10px] text-gray-600 mt-1 truncate">
                    {avatar.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Campo de Nome */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nome de usuário
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                console.log('Username changed to:', e.target.value);
                setUsername(e.target.value);
              }}
              placeholder="Seu nome"
              required
              minLength={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
