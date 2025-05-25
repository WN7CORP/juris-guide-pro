
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
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
      
      // Query comments with user profiles
      let query = supabase
        .from('article_comments')
        .select(`
          *,
          user_profiles!inner(username, avatar_url)
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

      const { data: commentsData, error } = await query;

      if (error) {
        throw error;
      }

      // Check which comments the current user has liked
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
        
        userLikes = likesData?.map(like => like.comment_id) || [];
      }

      // Map comments with user_liked flag
      const commentsWithLikes = commentsData?.map(comment => ({
        ...comment,
        user_liked: userLikes.includes(comment.id)
      })) || [];

      setComments(commentsWithLikes);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleId, sortBy, user]);

  const addComment = async (content: string, tag: Comment['tag']) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content,
          tag,
          likes_count: 0,
          is_recommended: false
        })
        .select(`
          *,
          user_profiles!inner(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newComment = {
        ...data,
        user_liked: false
      };

      setComments(prev => [newComment, ...prev]);
      return { data: newComment, error: null };
    } catch (error) {
      return { error };
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) return;

    try {
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

        if (!error) {
          setComments(prev => prev.map(c => 
            c.id === commentId 
              ? { 
                  ...c, 
                  user_liked: false,
                  likes_count: c.likes_count - 1
                }
              : c
          ));
        }
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (!error) {
          setComments(prev => prev.map(c => 
            c.id === commentId 
              ? { 
                  ...c, 
                  user_liked: true,
                  likes_count: c.likes_count + 1
                }
              : c
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { error } = await supabase
        .from('article_comments')
        .update({ is_recommended: !comment.is_recommended })
        .eq('id', commentId);

      if (!error) {
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, is_recommended: !c.is_recommended }
            : c
        ));
      }
    } catch (error) {
      console.error('Error toggling recommendation:', error);
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
