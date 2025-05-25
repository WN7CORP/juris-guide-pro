
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Heart, User } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserProfile } from '@/components/user/UserProfile';
import { toast } from 'sonner';

interface MinimalCommentSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
}

const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=fde2e4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=f0f9ff',
];

export const MinimalCommentSystem = ({ open, onOpenChange, articleId, articleNumber }: MinimalCommentSystemProps) => {
  const { user, profile } = useAuth();
  const { comments, loading, addComment, toggleLike } = useComments(articleId);
  
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newComment, setNewComment] = useState('');
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
    const { error } = await addComment(newComment.trim(), 'observacao');
    
    if (error) {
      toast.error('Erro ao enviar comentário');
    } else {
      toast.success('Comentário enviado!');
      setNewComment('');
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'agora' : `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col bg-white">
          <DialogHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              {articleNumber ? `Art. ${articleNumber}` : 'Comentários'}
              <span className="text-sm text-gray-500 font-normal">({comments.length})</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p>Carregando comentários...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Nenhum comentário ainda</p>
                <p className="text-sm">Seja o primeiro a compartilhar sua opinião!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage 
                      src={comment.user_profiles?.avatar_url || predefinedAvatars[0]} 
                      alt={comment.user_profiles?.username} 
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.user_profiles?.username || 'Usuário'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(comment.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                          comment.user_liked 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        disabled={!user}
                      >
                        <Heart className={`w-3 h-3 ${comment.user_liked ? 'fill-current' : ''}`} />
                        <span>{comment.likes_count}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Formulário de comentário */}
          <div className="border-t border-gray-100 pt-4 flex-shrink-0">
            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Faça login para comentar</p>
                <Button onClick={() => setShowAuth(true)} className="bg-blue-600 hover:bg-blue-700">
                  Entrar
                </Button>
              </div>
            ) : !profile ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Configure seu perfil para comentar</p>
                <Button onClick={() => setShowProfile(true)} className="bg-blue-600 hover:bg-blue-700">
                  Configurar Perfil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {profile?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="resize-none border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={submitting || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Comentar
                  </Button>
                </div>
              </form>
            )}
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
