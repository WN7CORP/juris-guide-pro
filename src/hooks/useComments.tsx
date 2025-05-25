
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  tag: 'dica' | 'duvida' | 'observacao' | 'correcao';
  likes_count: number;
  is_recommended: boolean;
  created_at: string;
  parent_id?: string | null;
  user_profiles?: {
    username: string;
    avatar_url?: string;
  } | null;
  user_liked?: boolean;
}

export type SortOption = 'most_liked' | 'recent' | 'oldest';

// Função helper para normalizar os dados vindos do banco
const normalizeComment = (rawComment: any): Comment => {
  return {
    id: rawComment.id,
    article_id: rawComment.article_id,
    user_id: rawComment.user_id,
    content: rawComment.content,
    tag: rawComment.tag || 'observacao',
    likes_count: rawComment.likes_count || 0,
    is_recommended: rawComment.is_recommended || false,
    created_at: rawComment.created_at,
    parent_id: rawComment.parent_id,
    user_profiles: rawComment.user_profiles || {
      username: 'Usuário',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawComment.user_id}&backgroundColor=b6e3f4`
    },
    user_liked: rawComment.user_liked || false
  };
};

// Função para garantir que o usuário tem perfil
const ensureUserProfile = async (userId: string) => {
  try {
    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Obter dados do usuário
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const baseUsername = email.split('@')[0] || `user_${userId.slice(-6)}`;
      
      // Tentar criar o perfil com username único
      let username = baseUsername;
      let attempt = 0;
      let profileCreated = false;

      while (!profileCreated && attempt < 10) {
        try {
          const { error } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              username: attempt === 0 ? username : `${username}_${attempt}`,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`
            });

          if (!error) {
            profileCreated = true;
            console.log('Profile created successfully for user:', userId);
          } else if (error.code === '23505') {
            // Username duplicado, tentar próximo
            attempt++;
          } else {
            throw error;
          }
        } catch (innerError) {
          console.error('Error creating profile attempt', attempt, innerError);
          attempt++;
        }
      }

      if (!profileCreated) {
        console.warn('Could not create profile after multiple attempts for user:', userId);
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
  }
};

export const useComments = (articleId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('most_liked');

  const loadComments = async () => {
    try {
      setLoading(true);
      console.log('Loading comments for article:', articleId);
      
      let query = supabase
        .from('article_comments')
        .select(`
          *,
          user_profiles (
            username,
            avatar_url
          )
        `)
        .eq('article_id', articleId)
        .is('parent_id', null); // Only load top-level comments for now

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
        toast.error('Erro ao carregar comentários');
        setComments([]);
        return;
      }

      console.log('Comments loaded:', data);

      // Check which comments the current user liked
      if (user && data && data.length > 0) {
        const commentIds = data.map(comment => comment.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedCommentIds = new Set(likes?.map(like => like.comment_id) || []);

        const commentsWithLikes = data.map(comment => ({
          ...comment,
          user_liked: likedCommentIds.has(comment.id)
        }));

        // Normalizar os comentários
        const normalizedComments = commentsWithLikes.map(normalizeComment);
        setComments(normalizedComments);
      } else {
        // Normalizar os comentários mesmo sem curtidas
        const normalizedComments = (data || []).map(normalizeComment);
        setComments(normalizedComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Erro inesperado ao carregar comentários');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!articleId) return;

    loadComments();

    // Subscribe to comment changes
    const subscription = supabase
      .channel(`comments-${articleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'article_comments',
        filter: `article_id=eq.${articleId}`
      }, (payload) => {
        console.log('Real-time comment update:', payload);
        loadComments(); // Reload comments when changes occur
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment_likes'
      }, (payload) => {
        console.log('Real-time like update:', payload);
        loadComments(); // Reload comments when likes change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [articleId, sortBy, user]);

  const addComment = async (content: string, tag: Comment['tag'], parentId?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return { error: new Error('User not authenticated') };
    }

    try {
      console.log('Adding comment:', { content, tag, parentId, articleId, userId: user.id });

      // Garantir que o usuário tem perfil antes de comentar
      await ensureUserProfile(user.id);

      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content,
          tag,
          parent_id: parentId || null
        })
        .select(`
          *,
          user_profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        
        // Se o erro for relacionado ao perfil, tentar criar o perfil e tentar novamente
        if (error.message.includes('violates foreign key constraint') || 
            error.message.includes('user_profiles')) {
          await ensureUserProfile(user.id);
          
          // Tentar novamente após garantir o perfil
          const { data: retryData, error: retryError } = await supabase
            .from('article_comments')
            .insert({
              article_id: articleId,
              user_id: user.id,
              content,
              tag,
              parent_id: parentId || null
            })
            .select(`
              *,
              user_profiles (
                username,
                avatar_url
              )
            `)
            .single();

          if (retryError) {
            console.error('Error adding comment on retry:', retryError);
            toast.error('Erro ao enviar comentário');
            return { error: retryError };
          }

          console.log('Comment added successfully on retry:', retryData);
          toast.success(parentId ? 'Resposta enviada!' : 'Comentário enviado!');
          
          // Reload comments to get the latest state
          await loadComments();
          
          return { data: normalizeComment(retryData), error: null };
        }
        
        toast.error('Erro ao enviar comentário');
        return { error };
      }

      console.log('Comment added successfully:', data);
      toast.success(parentId ? 'Resposta enviada!' : 'Comentário enviado!');
      
      // Reload comments to get the latest state
      await loadComments();
      
      return { data: normalizeComment(data), error: null };
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

      // Garantir que o usuário tem perfil
      await ensureUserProfile(user.id);

      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
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
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) {
          console.error('Error adding like:', error);
          toast.error('Erro ao curtir comentário');
          return;
        }
      }

      // Reload comments to get updated like counts
      await loadComments();
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

      // Get current recommendation status
      const { data: comment } = await supabase
        .from('article_comments')
        .select('is_recommended')
        .eq('id', commentId)
        .single();

      if (!comment) {
        toast.error('Comentário não encontrado');
        return;
      }

      // Toggle recommendation
      const { error } = await supabase
        .from('article_comments')
        .update({ is_recommended: !comment.is_recommended })
        .eq('id', commentId);

      if (error) {
        console.error('Error toggling recommendation:', error);
        toast.error('Erro ao recomendar comentário');
        return;
      }

      // Reload comments to get updated state
      await loadComments();
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
