
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
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
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1&backgroundColor=ddd6fe',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2&backgroundColor=fed7d7',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3&backgroundColor=d4edda',
];

export const MinimalCommentSystem = ({ open, onOpenChange, articleId, articleNumber }: MinimalCommentSystemProps) => {
  const { user, profile } = useAuth();
  const { comments, loading, addComment } = useComments(articleId);
  
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
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col bg-white">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-5 h-5" />
              {articleNumber ? `Art. ${articleNumber}` : 'Comentários'}
              <span className="text-sm text-gray-500 font-normal">({comments.length})</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando comentários...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum comentário ainda</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage 
                      src={comment.user_profiles?.avatar_url || predefinedAvatars[0]} 
                      alt={comment.user_profiles?.username} 
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {comment.user_profiles?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {comment.user_profiles?.username || 'Usuário'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Formulário de comentário */}
          <div className="border-t border-gray-100 pt-4">
            {!user ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3 text-sm">Faça login para comentar</p>
                <Button onClick={() => setShowAuth(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Entrar
                </Button>
              </div>
            ) : !profile ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3 text-sm">Configure seu perfil para comentar</p>
                <Button onClick={() => setShowProfile(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Configurar Perfil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {profile?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 min-h-[40px] max-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 px-3"
                  >
                    <Send className="w-4 h-4" />
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
