
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

      let query = supabase
        .from('article_comments')
        .select(`
          *,
          user_profiles (username, avatar_url),
          comment_likes!left (user_id)
        `)
        .eq('article_id', articleId);

      // Apply sorting
      switch (sortBy) {
        case 'most_liked':
          query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
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
        return;
      }

      // Process comments to include user_liked flag
      const processedComments = data?.map(comment => ({
        ...comment,
        user_liked: user ? comment.comment_likes?.some((like: any) => like.user_id === user.id) : false,
      })) || [];

      setComments(processedComments);
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
        })
        .select(`
          *,
          user_profiles (username, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        return { error };
      }

      // Add the new comment to the list
      setComments(prev => [{ ...data, user_liked: false }, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { error };
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.user_liked) {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (!error) {
          // Update local state
          setComments(prev => prev.map(c => 
            c.id === commentId 
              ? { ...c, likes_count: c.likes_count - 1, user_liked: false }
              : c
          ));
        }
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (!error) {
          // Update local state
          setComments(prev => prev.map(c => 
            c.id === commentId 
              ? { ...c, likes_count: c.likes_count + 1, user_liked: true }
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
