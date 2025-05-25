
import { useState } from "react";
import { Send, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Comment } from "@/hooks/useComments";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface User {
  id: string;
  email?: string;
}

interface CommentFormProps {
  onSubmit: (content: string, tag: Comment['tag']) => Promise<void>;
  user: User | null;
  profile: UserProfile | null;
  onShowAuth: () => void;
  onShowProfile: () => void;
}

const tagOptions = [
  { value: 'dica', label: 'Dica', color: 'bg-green-500/20 text-green-400 border-green-500/30', emoji: '💡' },
  { value: 'duvida', label: 'Dúvida', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', emoji: '❓' },
  { value: 'observacao', label: 'Observação', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', emoji: '👁️' },
  { value: 'correcao', label: 'Correção', color: 'bg-red-500/20 text-red-400 border-red-500/30', emoji: '✏️' },
];

export const CommentForm = ({ onSubmit, user, profile, onShowAuth, onShowProfile }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<Comment['tag']>('dica');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onShowAuth();
      return;
    }

    if (!profile) {
      onShowProfile();
      return;
    }

    if (!content.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), selectedTag);
      setContent('');
      setSelectedTag('dica');
      toast.success('Comentário publicado!');
    } catch (error) {
      toast.error('Erro ao publicar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-blue-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Smile className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Junte-se à comunidade</h3>
              <p className="text-gray-400">Entre para participar das discussões e compartilhar conhecimento</p>
            </div>
            <Button onClick={onShowAuth} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Entrar ou Cadastrar-se
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-purple-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Image className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Complete seu perfil</h3>
              <p className="text-gray-400">Configure seu avatar e nome de usuário para começar a comentar</p>
            </div>
            <Button onClick={onShowProfile} size="lg" className="bg-purple-600 hover:bg-purple-700 px-8">
              Configurar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedTagOption = tagOptions.find(option => option.value === selectedTag);

  return (
    <Card className="bg-gray-800/60 border-gray-700 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header do formulário */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-14 h-14 ring-3 ring-blue-500/30 shadow-lg">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-lg">
                {profile?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white text-lg">{profile?.username}</p>
              <p className="text-sm text-blue-400">Compartilhe seu conhecimento</p>
            </div>
          </div>

          {/* Seletor de tag */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              Categoria do comentário
            </label>
            <Select value={selectedTag} onValueChange={(value: Comment['tag']) => setSelectedTag(value)}>
              <SelectTrigger className="bg-gray-700/80 border-gray-600 text-white h-12 backdrop-blur-sm">
                <SelectValue>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{selectedTagOption?.emoji}</span>
                    <Badge variant="outline" className={`${selectedTagOption?.color} font-medium`}>
                      {selectedTagOption?.label}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-lg">
                {tagOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white focus:bg-gray-700 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.emoji}</span>
                      <Badge variant="outline" className={`${option.color} font-medium`}>
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área de texto */}
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe sua dica, dúvida ou observação sobre este artigo..."
              className="min-h-[140px] bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-base leading-relaxed"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{content.length}/500 caracteres</span>
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${content.length < 400 ? 'bg-green-500' : content.length < 450 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-600">
            <div className="flex gap-3">
              <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all">
                <Image className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all">
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publicando...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5" />
                  Publicar Comentário
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
