
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Heart, Award } from 'lucide-react';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserProfile } from '@/components/user/UserProfile';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

interface MinimalCommentSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
}

export const MinimalCommentSystem = ({ 
  open, 
  onOpenChange, 
  articleId, 
  articleNumber 
}: MinimalCommentSystemProps) => {
  const { user, profile } = useAuth();
  const { comments, loading, addComment, toggleLike, toggleRecommendation } = useComments(articleId);
  
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<Comment['tag']>('dica');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!profile) {
      setShowProfile(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    setSubmitting(true);
    const { error } = await addComment(newComment.trim(), selectedTag);
    
    if (error) {
      toast.error('Erro ao enviar comentário');
    } else {
      toast.success('Comentário enviado!');
      setNewComment('');
    }
    setSubmitting(false);
  };

  const tagOptions = [
    { value: 'dica', label: 'Dica' },
    { value: 'duvida', label: 'Dúvida' },
    { value: 'observacao', label: 'Observação' },
    { value: 'correcao', label: 'Correção' },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {articleNumber ? `Art. ${articleNumber}` : 'Comentários'}
              <span className="text-sm text-gray-400 font-normal">({comments.length})</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4">
            {/* Form de comentário */}
            {user && profile && (
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <Select value={selectedTag} onValueChange={(value: Comment['tag']) => setSelectedTag(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tagOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  className="min-h-[80px] resize-none"
                  required
                />
                
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar
                    </div>
                  )}
                </Button>
              </form>
            )}

            {!user && (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">Faça login para comentar</p>
                <Button onClick={() => setShowAuth(true)} variant="outline">
                  Entrar
                </Button>
              </div>
            )}

            {user && !profile && (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">Configure seu perfil para comentar</p>
                <Button onClick={() => setShowProfile(true)} variant="outline">
                  Configurar Perfil
                </Button>
              </div>
            )}
            
            {/* Lista de comentários */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <Loading size="md" text="Carregando comentários..." />
              ) : comments.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Sem comentários"
                  description="Seja o primeiro a comentar!"
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {comments.slice(0, 3).map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onToggleLike={toggleLike}
                      onToggleRecommendation={toggleRecommendation}
                      showActions={!!user}
                    />
                  ))}
                  {comments.length > 3 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-400">
                        +{comments.length - 3} comentários
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
        onSuccess={() => {
          setShowAuth(false);
          if (!profile) {
            setShowProfile(true);
          }
        }}
      />

      <UserProfile 
        open={showProfile} 
        onOpenChange={setShowProfile}
      />
    </>
  );
};
