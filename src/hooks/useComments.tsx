
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  tag: 'dica' | 'duvida' | 'observacao' | 'correcao';
  likes_count: number;
  is_recommended: boolean;
  created_at: string;
  parent_id?: string;
  user_profiles?: {
    username: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export type SortOption = 'most_liked' | 'recent' | 'oldest';

export const useComments = (articleId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('most_liked');

  const loadComments = async () => {
    try {
      setLoading(true);
      console.log('Loading comments for article:', articleId);
      
      // Since the comments table doesn't exist, we'll use mock data or empty array
      // This prevents the infinite loading while the database is being set up
      setComments([]);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Erro inesperado ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      loadComments();
    }
  }, [articleId, sortBy, user]);

  const addComment = async (content: string, tag: Comment['tag'], parentId?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return { error: new Error('User not authenticated') };
    }

    try {
      console.log('Adding comment:', { content, tag, parentId, articleId, userId: user.id });

      // Create a mock comment since the database table doesn't exist
      const newComment: Comment = {
        id: Date.now().toString(),
        article_id: articleId,
        user_id: user.id,
        content,
        tag,
        likes_count: 0,
        is_recommended: false,
        created_at: new Date().toISOString(),
        ...(parentId && { parent_id: parentId }),
        user_profiles: {
          username: user.email?.split('@')[0] || 'Usuário',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=b6e3f4`
        },
        user_liked: false,
      };

      setComments(prev => [newComment, ...prev]);
      toast.success(parentId ? 'Resposta enviada!' : 'Comentário enviado!');
      return { data: newComment, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro inesperado ao enviar comentário');
      return { error };
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    try {
      console.log('Toggling like for comment:', commentId);

      // Update local state since we can't access the database
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { 
              ...c, 
              user_liked: !c.user_liked,
              likes_count: !c.user_liked ? c.likes_count + 1 : c.likes_count - 1
            }
          : c
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Erro inesperado ao curtir comentário');
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para recomendar');
      return;
    }

    try {
      console.log('Toggling recommendation for comment:', commentId);

      // Update local state since we can't access the database
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, is_recommended: !c.is_recommended }
          : c
      ));
    } catch (error) {
      console.error('Error toggling recommendation:', error);
      toast.error('Erro inesperado ao recomendar comentário');
    }
  };

  return {
    comments,
    loading,
    sortBy,
    setSortBy,
    addComment,
    toggleLike,
    toggleRecommendation,
    refreshComments: loadComments,
  };
};
