
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CommentTag = 'dica' | 'ajuda' | 'duvida' | 'explicacao' | 'experiencia';

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userProfileType: string;
  content: string;
  tag: CommentTag;
  likes: string[]; // Array of user IDs who liked
  createdAt: Date;
  updatedAt: Date;
}

interface CommentsState {
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteComment: (commentId: string) => void;
  toggleLike: (commentId: string, userId: string) => void;
  getCommentsByArticle: (articleId: string) => Comment[];
  getCommentCount: (articleId: string) => number;
}

export const useCommentsStore = create<CommentsState>()(
  persist(
    (set, get) => ({
      comments: [],
      
      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          likes: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          comments: [newComment, ...state.comments]
        }));
      },
      
      deleteComment: (commentId) => {
        set((state) => ({
          comments: state.comments.filter(comment => comment.id !== commentId)
        }));
      },
      
      toggleLike: (commentId, userId) => {
        set((state) => ({
          comments: state.comments.map(comment => {
            if (comment.id === commentId) {
              const hasLiked = comment.likes.includes(userId);
              return {
                ...comment,
                likes: hasLiked 
                  ? comment.likes.filter(id => id !== userId)
                  : [...comment.likes, userId]
              };
            }
            return comment;
          })
        }));
      },
      
      getCommentsByArticle: (articleId) => {
        return get().comments
          .filter(comment => comment.articleId === articleId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getCommentCount: (articleId) => {
        return get().comments.filter(comment => comment.articleId === articleId).length;
      }
    }),
    {
      name: 'legal-hub-comments',
      version: 1,
    }
  )
);
