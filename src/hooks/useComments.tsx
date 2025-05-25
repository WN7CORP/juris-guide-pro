
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
      
      console.log('Loading comments for article:', articleId);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!inner(username, avatar_url)
        `)
        .eq('article_id', articleId)
        .order(getSortColumn(sortBy), { ascending: sortBy === 'oldest' });

      if (error) {
        console.error('Error loading comments from database:', error);
        // Fallback to localStorage
        loadCommentsFromLocalStorage();
        return;
      }

      // Get user likes if user is authenticated
      let userLikes: string[] = [];
      if (user && data?.length > 0) {
        const commentIds = data.map(c => c.id);
        const { data: likesData, error: likesError } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        if (!likesError) {
          userLikes = likesData?.map(l => l.comment_id) || [];
        }
      }

      // Process comments with user_liked flag
      const processedComments: Comment[] = data?.map(comment => ({
        id: comment.id,
        article_id: comment.article_id,
        user_id: comment.user_id,
        content: comment.content,
        tag: comment.tag as Comment['tag'],
        likes_count: comment.likes_count || 0,
        is_recommended: comment.is_recommended || false,
        created_at: comment.created_at,
        user_profiles: comment.user_profiles,
        user_liked: userLikes.includes(comment.id),
      })) || [];

      console.log('Loaded comments from database:', processedComments.length);
      setComments(processedComments);

      // Migrate localStorage data if database is empty
      if (processedComments.length === 0) {
        await migrateCommentsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      loadCommentsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsFromLocalStorage = () => {
    try {
      const storedComments = localStorage.getItem(`comments_${articleId}`);
      const allComments: Comment[] = storedComments ? JSON.parse(storedComments) : [];
      
      // Apply sorting
      let sortedComments = [...allComments];
      switch (sortBy) {
        case 'most_liked':
          sortedComments.sort((a, b) => b.likes_count - a.likes_count);
          break;
        case 'recent':
          sortedComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          sortedComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
      }

      // Add user_liked flag
      const commentsWithLikeStatus = sortedComments.map(comment => ({
        ...comment,
        user_liked: user ? comment.user_liked || false : false,
      }));

      setComments(commentsWithLikeStatus);
    } catch (error) {
      console.error('Error loading comments from localStorage:', error);
    }
  };

  const migrateCommentsFromLocalStorage = async () => {
    try {
      if (!user) return;

      const storedComments = localStorage.getItem(`comments_${articleId}`);
      if (!storedComments) return;

      const localComments = JSON.parse(storedComments);
      if (!Array.isArray(localComments) || localComments.length === 0) return;

      console.log('Migrating comments from localStorage to database:', localComments.length);

      const commentsToInsert = localComments.map((comment: any) => ({
        user_id: comment.user_id,
        article_id: comment.article_id,
        content: comment.content,
        tag: comment.tag,
        likes_count: comment.likes_count || 0,
        is_recommended: comment.is_recommended || false,
        created_at: comment.created_at,
      }));

      const { error } = await supabase
        .from('comments')
        .insert(commentsToInsert);

      if (error) {
        console.error('Error migrating comments:', error);
      } else {
        console.log('Successfully migrated comments to database');
        // Reload from database
        await loadComments();
        // Remove from localStorage after successful migration
        localStorage.removeItem(`comments_${articleId}`);
      }
    } catch (error) {
      console.error('Error in migrateCommentsFromLocalStorage:', error);
    }
  };

  const getSortColumn = (sort: SortOption): string => {
    switch (sort) {
      case 'most_liked':
        return 'likes_count';
      case 'recent':
        return 'created_at';
      case 'oldest':
        return 'created_at';
      default:
        return 'created_at';
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleId, sortBy, user]);

  const addComment = async (content: string, tag: Comment['tag']) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          article_id: articleId,
          content,
          tag,
        })
        .select(`
          *,
          user_profiles!inner(username, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error adding comment to database:', error);
        // Fallback to localStorage
        return addCommentToLocalStorage(content, tag);
      }

      const newComment: Comment = {
        id: data.id,
        article_id: data.article_id,
        user_id: data.user_id,
        content: data.content,
        tag: data.tag as Comment['tag'],
        likes_count: data.likes_count || 0,
        is_recommended: data.is_recommended || false,
        created_at: data.created_at,
        user_profiles: data.user_profiles,
        user_liked: false,
      };

      setComments(prev => [newComment, ...prev]);
      return { data: newComment, error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return addCommentToLocalStorage(content, tag);
    }
  };

  const addCommentToLocalStorage = async (content: string, tag: Comment['tag']) => {
    try {
      const storedComments = localStorage.getItem(`comments_${articleId}`);
      const existingComments: Comment[] = storedComments ? JSON.parse(storedComments) : [];
      
      // Get user profile from localStorage
      const storedProfile = localStorage.getItem(`profile_${user!.id}`);
      const userProfile = storedProfile ? JSON.parse(storedProfile) : null;

      const newComment: Comment = {
        id: Date.now().toString(),
        article_id: articleId,
        user_id: user!.id,
        content,
        tag,
        likes_count: 0,
        is_recommended: false,
        created_at: new Date().toISOString(),
        user_profiles: userProfile ? {
          username: userProfile.username,
          avatar_url: userProfile.avatar_url,
        } : undefined,
        user_liked: false,
      };

      const updatedComments = [newComment, ...existingComments];
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updatedComments));
      
      setComments(prev => [newComment, ...prev]);
      return { data: newComment, error: null };
    } catch (error) {
      console.error('Error adding comment to localStorage:', error);
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
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        if (error) {
          console.error('Error removing like:', error);
          toggleLikeLocalStorage(commentId);
          return;
        }
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            user_id: user.id,
            comment_id: commentId,
          });

        if (error) {
          console.error('Error adding like:', error);
          toggleLikeLocalStorage(commentId);
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
      toggleLikeLocalStorage(commentId);
    }
  };

  const toggleLikeLocalStorage = (commentId: string) => {
    try {
      const storedComments = localStorage.getItem(`comments_${articleId}`);
      const existingComments: Comment[] = storedComments ? JSON.parse(storedComments) : [];
      
      const updatedComments = existingComments.map(comment => {
        if (comment.id === commentId) {
          const newLikedStatus = !comment.user_liked;
          return {
            ...comment,
            user_liked: newLikedStatus,
            likes_count: newLikedStatus ? comment.likes_count + 1 : comment.likes_count - 1,
          };
        }
        return comment;
      });

      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updatedComments));
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
      console.error('Error toggling like in localStorage:', error);
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { error } = await supabase
        .from('comments')
        .update({ is_recommended: !comment.is_recommended })
        .eq('id', commentId);

      if (error) {
        console.error('Error toggling recommendation:', error);
        toggleRecommendationLocalStorage(commentId);
        return;
      }

      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, is_recommended: !c.is_recommended }
          : c
      ));
    } catch (error) {
      console.error('Error toggling recommendation:', error);
      toggleRecommendationLocalStorage(commentId);
    }
  };

  const toggleRecommendationLocalStorage = (commentId: string) => {
    try {
      const storedComments = localStorage.getItem(`comments_${articleId}`);
      const existingComments: Comment[] = storedComments ? JSON.parse(storedComments) : [];
      
      const updatedComments = existingComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_recommended: !comment.is_recommended,
          };
        }
        return comment;
      });

      localStorage.setItem(`comments_${articleId}`, JSON.stringify(updatedComments));
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, is_recommended: !c.is_recommended }
          : c
      ));
    } catch (error) {
      console.error('Error toggling recommendation in localStorage:', error);
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
