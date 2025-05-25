
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  User, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  Reply,
  Star
} from 'lucide-react';
import { useComments, type SortOption } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedCommentSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleNumber?: string;
}

const tagColors = {
  dica: 'bg-green-100 text-green-800 border-green-200',
  duvida: 'bg-blue-100 text-blue-800 border-blue-200',
  observacao: 'bg-gray-100 text-gray-800 border-gray-200',
  correcao: 'bg-red-100 text-red-800 border-red-200',
};

const tagLabels = {
  dica: 'Dica',
  duvida: 'Dúvida',
  observacao: 'Observação',
  correcao: 'Correção',
};

export const EnhancedCommentSystem = ({ 
  open, 
  onOpenChange, 
  articleId, 
  articleNumber 
}: EnhancedCommentSystemProps) => {
  const { user, profile } = useAuth();
  const { comments, loading, sortBy, setSortBy, addComment, toggleLike } = useComments(articleId);
  
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<'dica' | 'duvida' | 'observacao' | 'correcao'>('observacao');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.user_profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTag === 'all' || comment.tag === filterTag;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const totalComments = comments.length;
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes_count, 0);
    const topContributor = comments.reduce((prev, current) => 
      (current.likes_count > (prev?.likes_count || 0)) ? current : prev, null as any
    );
    
    return { totalComments, totalLikes, topContributor };
  };

  const stats = getStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5 text-law-accent" />
              {articleNumber ? `Art. ${articleNumber}` : 'Comentários'}
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                {stats.totalComments}
              </Badge>
            </DialogTitle>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart className="w-4 h-4" />
              <span>{stats.totalLikes} curtidas</span>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar comentários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="dica">Dicas</SelectItem>
                  <SelectItem value="duvida">Dúvidas</SelectItem>
                  <SelectItem value="observacao">Observações</SelectItem>
                  <SelectItem value="correcao">Correções</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-36 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="most_liked">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Mais curtidos
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Mais recentes
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-accent mx-auto mb-3"></div>
              <p>Carregando comentários...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {searchTerm || filterTag !== 'all' ? 'Nenhum comentário encontrado' : 'Nenhum comentário ainda'}
              </p>
              <p className="text-sm">
                {searchTerm || filterTag !== 'all' ? 'Tente ajustar os filtros' : 'Seja o primeiro a compartilhar sua opinião!'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredComments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 rounded-xl hover:bg-gray-800/50 transition-all border border-gray-700/50 hover:border-gray-600"
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage 
                        src={comment.user_profiles?.avatar_url} 
                        alt={comment.user_profiles?.username} 
                      />
                      <AvatarFallback className="bg-law-accent/20 text-law-accent text-sm">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">
                          {comment.user_profiles?.username || 'Usuário'}
                        </span>
                        
                        <Badge className={`text-xs ${tagColors[comment.tag]}`}>
                          {tagLabels[comment.tag]}
                        </Badge>
                        
                        {comment.is_recommended && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                        
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(comment.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                            comment.user_liked 
                              ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' 
                              : 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                          }`}
                          disabled={!user}
                        >
                          <Heart className={`w-3 h-3 ${comment.user_liked ? 'fill-current' : ''}`} />
                          <span>{comment.likes_count}</span>
                        </button>
                        
                        <button className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-all">
                          <Reply className="w-3 h-3" />
                          <span>Responder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Comment Form */}
        <div className="border-t border-gray-700 pt-4 flex-shrink-0">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                <AvatarFallback className="bg-law-accent/20 text-law-accent text-xs">
                  {profile?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Compartilhe sua opinião, dúvida ou dica..."
                  className="resize-none bg-gray-800 border-gray-600 text-white focus:border-law-accent min-h-[80px]"
                  rows={3}
                />
                
                <div className="flex items-center justify-between">
                  <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value as any)}>
                    <SelectTrigger className="w-36 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="observacao">💬 Observação</SelectItem>
                      <SelectItem value="dica">💡 Dica</SelectItem>
                      <SelectItem value="duvida">❓ Dúvida</SelectItem>
                      <SelectItem value="correcao">⚠️ Correção</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    type="submit" 
                    disabled={submitting || !newComment.trim()}
                    className="bg-law-accent hover:bg-law-accent/90"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
