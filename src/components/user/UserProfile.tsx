
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

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { profile, updateProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Sincronizar estado local com dados do perfil quando modal abre
  useEffect(() => {
    if (open && profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
    } else if (open && !profile && user) {
      // Se não há perfil mas há usuário, usar email como username inicial
      setUsername(user.email?.split('@')[0] || '');
      setAvatarUrl('');
    }
  }, [open, profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para atualizar o perfil');
      return;
    }

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
      const { error } = await updateProfile(trimmedUsername, avatarUrl || undefined);
      
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

  const generateAvatarUrl = () => {
    const avatarUrls = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
      'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1',
      'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2',
      'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3',
    ];
    
    const randomUrl = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    setAvatarUrl(randomUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={generateAvatarUrl}
            >
              Gerar Avatar Aleatório
            </Button>
          </div>
          
          <div>
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
              minLength={3}
            />
          </div>
          
          <div>
            <Label htmlFor="avatar-url">URL do Avatar (opcional)</Label>
            <Input
              id="avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
              type="url"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
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
