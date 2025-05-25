
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Scale, Sparkles } from 'lucide-react';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const legalAvatars = [
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=judge&backgroundColor=1e3a8a&clothesType=blazerSweater&clothesColor=262e33&hairColor=2c1b18&skinColor=f8d25c',
    title: 'Juiz(a)',
    description: 'Magistrado do Poder Judiciário'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lawyer&backgroundColor=1e40af&clothesType=shirtCrewNeck&clothesColor=262e33&hairColor=724133&skinColor=d08b5b',
    title: 'Advogado(a)',
    description: 'Profissional da advocacia'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prosecutor&backgroundColor=1d4ed8&clothesType=blazerShirt&clothesColor=3c4142&hairColor=a55728&skinColor=ae5d29',
    title: 'Promotor(a)',
    description: 'Membro do Ministério Público'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=defender&backgroundColor=1e40af&clothesType=shirtScoopNeck&clothesColor=262e33&hairColor=4a312c&skinColor=614335',
    title: 'Defensor(a) Público(a)',
    description: 'Assistência jurídica gratuita'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attorney&backgroundColor=2563eb&clothesType=blazerSweater&clothesColor=3c4142&hairColor=2c1b18&skinColor=fdbcb4',
    title: 'Procurador(a)',
    description: 'Representante legal do Estado'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=notary&backgroundColor=1d4ed8&clothesType=shirtCrewNeck&clothesColor=5199e4&hairColor=724133&skinColor=edb98a',
    title: 'Tabelião/Notário',
    description: 'Profissional de cartório'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student&backgroundColor=3b82f6&clothesType=hoodie&clothesColor=262e33&hairColor=c93305&skinColor=f8d25c',
    title: 'Estudante de Direito',
    description: 'Acadêmico em formação'
  },
  {
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professor&backgroundColor=1e40af&clothesType=shirtVNeck&clothesColor=3c4142&hairColor=65c9ff&skinColor=d08b5b',
    title: 'Professor(a) de Direito',
    description: 'Educador jurídico'
  },
];

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { profile, updateProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (open && profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || legalAvatars[0].url);
    } else if (open && !profile && user) {
      setUsername(user.email?.split('@')[0] || '');
      setAvatarUrl(legalAvatars[0].url);
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
      const { error } = await updateProfile(trimmedUsername, avatarUrl || legalAvatars[0].url);
      
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
    const randomAvatar = legalAvatars[Math.floor(Math.random() * legalAvatars.length)];
    setAvatarUrl(randomAvatar.url);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200/50 shadow-2xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl sm:text-2xl font-serif text-slate-800 flex items-center justify-center gap-2">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Configurar Perfil Profissional
            </DialogTitle>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 px-2">
              Escolha seu avatar e personalize sua identidade jurídica
            </p>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Principal */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 relative ring-4 ring-blue-200 shadow-xl transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xl sm:text-2xl font-semibold">
                    <Scale className="w-8 h-8 sm:w-10 sm:h-10" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={selectRandomAvatar}
                className="flex items-center gap-2 bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm text-xs sm:text-sm"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Avatar Aleatório
              </Button>
            </div>

            {/* Grid de Avatares Profissionais */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-700 text-center flex items-center justify-center gap-2">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Escolha sua Profissão Jurídica
              </h3>
              
              <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-white/60 rounded-xl border border-blue-100 backdrop-blur-sm">
                {legalAvatars.map((avatar, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(avatar.url)}
                        className={`group relative p-1.5 sm:p-2 rounded-xl border-2 transition-all duration-300 ${
                          avatarUrl === avatar.url 
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-25 hover:scale-102 hover:shadow-md'
                        }`}
                      >
                        {avatarUrl === avatar.url && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto">
                          <AvatarImage src={avatar.url} alt={avatar.title} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                            <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-[10px] sm:text-xs font-medium text-slate-700 mt-1 truncate px-1">
                          {avatar.title}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                      <div className="text-center">
                        <div className="font-semibold text-xs sm:text-sm">{avatar.title}</div>
                        <div className="text-[10px] sm:text-xs text-slate-300">{avatar.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            {/* Campo de Nome de Usuário */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-semibold flex items-center gap-2 text-sm">
                Nome de Usuário
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário"
                required
                minLength={3}
                className="border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/80 transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-sm"
              />
              <p className="text-xs text-slate-500 px-1">
                Mínimo de 3 caracteres. Este será seu nome público na plataforma.
              </p>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-sm" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Scale className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Salvar Perfil
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200 text-sm"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
