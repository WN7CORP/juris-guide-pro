
import { useState } from "react";
import { Send, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";
import { Comment } from "@/hooks/useComments";
import { toast } from "sonner";

interface CommentFormProps {
  onSubmit: (content: string, tag: Comment['tag']) => Promise<void>;
  user: User | null;
  profile: any;
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
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-blue-400">
              <User className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Faça parte da comunidade</h3>
              <p className="text-sm text-gray-400">Entre para participar das discussões</p>
            </div>
            <Button onClick={onShowAuth} className="bg-blue-600 hover:bg-blue-700">
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
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-purple-400">
              <User className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Complete seu perfil</h3>
              <p className="text-sm text-gray-400">Configure seu avatar e nome de usuário</p>
            </div>
            <Button onClick={onShowProfile} className="bg-purple-600 hover:bg-purple-700">
              Configurar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedTagOption = tagOptions.find(option => option.value === selectedTag);

  return (
    <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header do formulário */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 ring-2 ring-blue-500/20">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
              <AvatarFallback className="bg-blue-600">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{profile?.username}</p>
              <p className="text-xs text-gray-400">Compartilhe seu conhecimento</p>
            </div>
          </div>

          {/* Seletor de tag */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Categoria do comentário</label>
            <Select value={selectedTag} onValueChange={(value: Comment['tag']) => setSelectedTag(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{selectedTagOption?.emoji}</span>
                    <Badge variant="outline" className={selectedTagOption?.color}>
                      {selectedTagOption?.label}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {tagOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <Badge variant="outline" className={option.color}>
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área de texto */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe sua dica, dúvida ou observação sobre este artigo..."
              className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{content.length}/500 caracteres</span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Image className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publicando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Publicar
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
