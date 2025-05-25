
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
        return;
      }

      // Process comments to add user_liked flag
      const commentsWithLikeStatus = data?.map(comment => ({
        ...comment,
        user_liked: user ? comment.comment_likes?.some((like: any) => like.user_id === user.id) || false : false,
      })) || [];

      setComments(commentsWithLikeStatus);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleId, sortBy, user]);

  const addComment = async (content: string, tag: Comment['tag'], parentId?: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content,
          tag,
          parent_id: parentId,
        })
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
        return { error };
      }

      // Add the new comment to the state
      const newComment = {
        ...data,
        user_liked: false,
      };

      setComments(prev => [newComment, ...prev]);
      return { data: newComment, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
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
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
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
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) return;

    try {
      // Get current comment
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { error } = await supabase
        .from('article_comments')
        .update({ is_recommended: !comment.is_recommended })
        .eq('id', commentId);

      if (error) {
        console.error('Error toggling recommendation:', error);
        return;
      }

      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, is_recommended: !c.is_recommended }
          : c
      ));
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
