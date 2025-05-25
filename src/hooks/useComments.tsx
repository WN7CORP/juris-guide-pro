
import { useState, useEffect } from 'react';
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
  parent_id?: string; // New field for replies
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
      
      // Temporary implementation using localStorage
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
      const storedComments = localStorage.getItem(`comments_${articleId}`);
      const existingComments: Comment[] = storedComments ? JSON.parse(storedComments) : [];
      
      // Get user profile from localStorage
      const storedProfile = localStorage.getItem(`profile_${user.id}`);
      const userProfile = storedProfile ? JSON.parse(storedProfile) : null;

      const newComment: Comment = {
        id: Date.now().toString(),
        article_id: articleId,
        user_id: user.id,
        content,
        tag,
        likes_count: 0,
        is_recommended: false,
        created_at: new Date().toISOString(),
        parent_id: parentId,
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
      console.error('Error adding comment:', error);
      return { error };
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) return;

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
      console.error('Error toggling like:', error);
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) return;

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
