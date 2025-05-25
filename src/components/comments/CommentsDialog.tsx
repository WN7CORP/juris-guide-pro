
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useCommentsStore, CommentTag } from '@/store/commentsStore';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { MessageCircle, Heart, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
}

const commentTags: { value: CommentTag; label: string; color: string }[] = [
  { value: 'dica', label: 'Dica', color: 'bg-green-500/20 text-green-400' },
  { value: 'ajuda', label: 'Ajuda', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'duvida', label: 'Dúvida', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'explicacao', label: 'Explicação', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'experiencia', label: 'Experiência', color: 'bg-orange-500/20 text-orange-400' }
];

export const CommentsDialog = ({ open, onOpenChange, articleId, articleNumber }: CommentsDialogProps) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<CommentTag | ''>('');
  const { user, isAuthenticated } = useAuthStore();
  const { addComment, getCommentsByArticle, toggleLike } = useCommentsStore();

  const comments = getCommentsByArticle(articleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setAuthDialogOpen(true);
      return;
    }

    if (!newComment.trim() || !selectedTag) {
      toast.error('Por favor, escreva um comentário e selecione uma tag');
      return;
    }

    addComment({
      articleId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userProfileType: user.profileType,
      content: newComment.trim(),
      tag: selectedTag as CommentTag
    });

    setNewComment('');
    setSelectedTag('');
    toast.success('Comentário adicionado com sucesso!');
  };

  const handleLike = (commentId: string) => {
    if (!isAuthenticated || !user) {
      setAuthDialogOpen(true);
      return;
    }
    toggleLike(commentId, user.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagInfo = (tag: CommentTag) => {
    return commentTags.find(t => t.value === tag) || commentTags[0];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-netflix-dark border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-law-accent flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comentários - Art. {articleNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isAuthenticated ? "Compartilhe seu conhecimento..." : "Faça login para comentar"}
                className="bg-gray-800 border-gray-700 min-h-[80px]"
                disabled={!isAuthenticated}
              />
              
              {isAuthenticated && (
                <div className="flex gap-3">
                  <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value as CommentTag)}>
                    <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Selecione uma tag" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {commentTags.map((tag) => (
                        <SelectItem key={tag.value} value={tag.value}>
                          <span className={`px-2 py-1 rounded-full text-xs ${tag.color}`}>
                            {tag.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button type="submit" className="bg-law-accent hover:bg-law-accent/90">
                    Comentar
                  </Button>
                </div>
              )}
              
              {!isAuthenticated && (
                <Button 
                  type="button" 
                  onClick={() => setAuthDialogOpen(true)}
                  className="bg-law-accent hover:bg-law-accent/90"
                >
                  Fazer Login para Comentar
                </Button>
              )}
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Ainda não há comentários neste artigo.</p>
                  <p className="text-sm">Seja o primeiro a compartilhar seu conhecimento!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const tagInfo = getTagInfo(comment.tag);
                  return (
                    <div key={comment.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{comment.userAvatar}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-200">{comment.userName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${tagInfo.color}`}>
                                {tagInfo.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {comment.userProfileType} • {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            isAuthenticated && user && comment.likes.includes(user.id)
                              ? 'text-red-400'
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                          <span>{comment.likes.length}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};
