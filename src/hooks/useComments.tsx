
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Fetch comments with user profiles and like status
      let query = supabase
        .from('article_comments')
        .select(`
          *,
          user_profiles!article_comments_user_id_fkey (
            username,
            avatar_url
          ),
          comment_likes!left (
            user_id
          )
        `)
        .eq('article_id', articleId);

      // Apply sorting
      switch (sortBy) {
        case 'most_liked':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading comments:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === '42P01') {
          toast.error('Tabela de comentários não encontrada. Execute o script SQL no Supabase.');
        } else {
          toast.error('Erro ao carregar comentários: ' + error.message);
        }
        return;
      }

      console.log('Comments loaded successfully:', data);

      // Process comments to add user_liked flag
      const commentsWithLikeStatus = data?.map(comment => ({
        ...comment,
        user_liked: user ? comment.comment_likes?.some((like: any) => like.user_id === user.id) || false : false,
      })) || [];

      setComments(commentsWithLikeStatus);
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

      const commentData = {
        article_id: articleId,
        user_id: user.id,
        content,
        tag,
        ...(parentId && { parent_id: parentId }),
      };

      const { data, error } = await supabase
        .from('article_comments')
        .insert(commentData)
        .select(`
          *,
          user_profiles!article_comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === '42P01') {
          toast.error('Tabela de comentários não encontrada. Execute o script SQL no Supabase.');
        } else if (error.code === '23503') {
          toast.error('Erro de referência. Verifique se seu perfil está configurado.');
        } else {
          toast.error('Erro ao enviar comentário: ' + error.message);
        }
        return { error };
      }

      console.log('Comment added successfully:', data);

      // Add the new comment to the state
      const newComment = {
        ...data,
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

      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing like:', error);
          toast.error('Erro ao remover curtida');
          return;
        }
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (error) {
          console.error('Error adding like:', error);
          if (error.code === '42P01') {
            toast.error('Tabela de curtidas não encontrada. Execute o script SQL no Supabase.');
          } else {
            toast.error('Erro ao curtir comentário');
          }
          return;
        }
      }

      // Update local state
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

      // Get current comment
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { error } = await supabase
        .from('article_comments')
        .update({ is_recommended: !comment.is_recommended })
        .eq('id', commentId);

      if (error) {
        console.error('Error toggling recommendation:', error);
        toast.error('Erro ao recomendar comentário');
        return;
      }

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
