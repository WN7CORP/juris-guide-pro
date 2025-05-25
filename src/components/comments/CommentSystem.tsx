
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Filter, Loader2, Plus, Reply, User, MessageCircle, X } from 'lucide-react';
import { useComments, SortOption, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserProfile } from '@/components/user/UserProfile';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CommentSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
  trigger?: React.ReactNode;
}

export const CommentSystem = ({ 
  open, 
  onOpenChange, 
  articleId, 
  articleNumber,
  trigger 
}: CommentSystemProps) => {
  const { user, profile } = useAuth();
  const { comments, loading, sortBy, setSortBy, addComment, toggleLike, toggleRecommendation } = useComments(articleId);
  const isMobile = useIsMobile();
  
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<Comment['tag']>('dica');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

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
    const { error } = await addComment(
      newComment.trim(), 
      replyingTo ? replyingTo.tag : selectedTag, 
      replyingTo?.id
    );
    
    if (error) {
      toast.error('Erro ao enviar comentário');
    } else {
      toast.success(replyingTo ? 'Resposta enviada!' : 'Comentário enviado!');
      setNewComment('');
      setSelectedTag('dica');
      setReplyingTo(null);
    }
    setSubmitting(false);
  };

  const handleReply = (commentId: string, parentComment: Comment) => {
    setReplyingTo(parentComment);
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'most_liked', label: 'Mais Curtidos' },
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'oldest', label: 'Mais Antigos' },
  ];

  const tagOptions = [
    { value: 'dica', label: 'Dica' },
    { value: 'duvida', label: 'Dúvida' },
    { value: 'observacao', label: 'Observação' },
    { value: 'correcao', label: 'Correção' },
  ];

  // Organize comments with replies
  const organizedComments = comments.filter(comment => !comment.parent_id);
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parent_id === commentId);
  };

  const contentComponent = (
    <>
      <div className="border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-law-accent" />
              {articleNumber ? `Art. ${articleNumber}` : 'Comentários'}
              <span className="text-sm text-gray-400 font-normal">({comments.length})</span>
            </h2>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-4">
          <TabsTrigger value="view">Ver Comentários</TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Ordenar por:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : organizedComments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ainda não há comentários neste artigo.</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              organizedComments.map(comment => {
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="space-y-3">
                    <CommentItem
                      comment={comment}
                      onToggleLike={toggleLike}
                      onToggleRecommendation={toggleRecommendation}
                      onReply={handleReply}
                    />
                    {replies.map(reply => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onToggleLike={toggleLike}
                        onToggleRecommendation={toggleRecommendation}
                        isReply={true}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="add" className="flex-1 flex flex-col">
          {!user ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-300 mb-2">Faça login para comentar</p>
                  <Button onClick={() => setShowAuth(true)}>
                    Entrar ou Cadastrar
                  </Button>
                </div>
              </div>
            </div>
          ) : !profile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-300 mb-2">Configure seu perfil para comentar</p>
                  <Button onClick={() => setShowProfile(true)}>
                    Configurar Perfil
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="flex-1 flex flex-col space-y-4">
              {replyingTo && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-400 font-medium flex items-center gap-2">
                      <Reply className="w-4 h-4" />
                      Respondendo a {replyingTo.user_profiles?.username}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded">
                    {replyingTo.content.length > 100 
                      ? replyingTo.content.substring(0, 100) + '...' 
                      : replyingTo.content
                    }
                  </p>
                </div>
              )}
              
              {!replyingTo && (
                <div>
                  <Label htmlFor="tag">Categoria do Comentário</Label>
                  <Select value={selectedTag} onValueChange={(value: Comment['tag']) => setSelectedTag(value)}>
                    <SelectTrigger>
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
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <Label htmlFor="comment">
                  {replyingTo ? 'Sua Resposta' : 'Seu Comentário'}
                </Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Digite sua resposta..." : "Digite seu comentário..."}
                  className="flex-1 min-h-[120px] resize-none"
                  required
                />
              </div>
              
              <Button type="submit" disabled={submitting} className="self-end">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {replyingTo ? 'Enviar Resposta' : 'Enviar Comentário'}
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
          <SheetContent side="right" className="w-full bg-gray-900 border-gray-800 overflow-y-auto p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Comentários</SheetTitle>
            </SheetHeader>
            
            <div className="h-full p-4">
              {contentComponent}
            </div>
          </SheetContent>
        </Sheet>

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
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="sr-only">Comentários</DialogTitle>
          </DialogHeader>
          
          {contentComponent}
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
