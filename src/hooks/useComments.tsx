
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
  user_profiles?: {
    username: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export type SortOption = 'most_liked' | 'recent' | 'oldest';

// Mock data for demonstration
const mockComments: Comment[] = [
  {
    id: 'comment_1',
    article_id: 'art_1',
    user_id: 'user_1',
    content: 'Este artigo é muito importante para entender os direitos fundamentais. Uma dica é sempre relacionar com casos práticos.',
    tag: 'dica',
    likes_count: 5,
    is_recommended: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_profiles: {
      username: 'JuristaExperiente',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4'
    },
    user_liked: false
  },
  {
    id: 'comment_2',
    article_id: 'art_1',
    user_id: 'user_2',
    content: 'Tenho uma dúvida sobre a aplicabilidade deste artigo em casos específicos. Alguém pode esclarecer?',
    tag: 'duvida',
    likes_count: 2,
    is_recommended: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_profiles: {
      username: 'EstudanteDireito',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=c0aede'
    },
    user_liked: false
  }
];

export const useComments = (articleId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('most_liked');

  const loadComments = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock comments by article ID and apply sorting
      let filteredComments = mockComments.filter(comment => 
        comment.article_id === articleId || articleId === 'art_1' // Show mock data for testing
      );

      // Apply sorting
      switch (sortBy) {
        case 'most_liked':
          filteredComments.sort((a, b) => b.likes_count - a.likes_count);
          break;
        case 'recent':
          filteredComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          filteredComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
      }

      setComments(filteredComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        article_id: articleId,
        user_id: user.id,
        content,
        tag,
        likes_count: 0,
        is_recommended: false,
        created_at: new Date().toISOString(),
        user_profiles: {
          username: `user_${user.id.slice(-4)}`,
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new&backgroundColor=b6e3f4'
        },
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const wasLiked = comment.user_liked;
          return {
            ...comment,
            user_liked: !wasLiked,
            likes_count: wasLiked ? comment.likes_count - 1 : comment.likes_count + 1
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleRecommendation = async (commentId: string) => {
    if (!user) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, is_recommended: !comment.is_recommended }
          : comment
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
