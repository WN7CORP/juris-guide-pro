
import { create } from 'zustand';

export interface ArticleComment {
  id: string;
  article_id: string;
  code_id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes_count: number;
  isLiked: boolean;
  created_at: string;
  updated_at: string;
}

interface CommentsState {
  comments: ArticleComment[];
  loading: boolean;
  fetchComments: (articleId: string, codeId: string) => Promise<void>;
  addComment: (articleId: string, codeId: string, content: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  loading: false,

  fetchComments: async (articleId: string, codeId: string) => {
    set({ loading: true });
    
    try {
      // Simulação de dados - em produção, usar Supabase
      const mockComments: ArticleComment[] = [
        {
          id: '1',
          article_id: articleId,
          code_id: codeId,
          content: 'Excelente artigo! Muito esclarecedor sobre os direitos fundamentais.',
          author: {
            id: '1',
            name: 'Carlos Silva'
          },
          likes_count: 3,
          isLiked: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          article_id: articleId,
          code_id: codeId,
          content: 'Tenho uma dúvida sobre a aplicação prática deste artigo. Alguém pode me ajudar?',
          author: {
            id: '2',
            name: 'Ana Costa'
          },
          likes_count: 1,
          isLiked: true,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Filtrar comentários apenas para este artigo específico
      const filteredComments = mockComments.filter(
        comment => comment.article_id === articleId && comment.code_id === codeId
      );

      set({ comments: filteredComments, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addComment: async (articleId: string, codeId: string, content: string) => {
    const { comments } = get();
    
    const newComment: ArticleComment = {
      id: Date.now().toString(),
      article_id: articleId,
      code_id: codeId,
      content: content,
      author: {
        id: '1', // Mock user ID
        name: 'Usuário Demo'
      },
      likes_count: 0,
      isLiked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    set({ comments: [newComment, ...comments] });
  },

  likeComment: async (commentId: string) => {
    const { comments } = get();
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes_count: comment.isLiked ? comment.likes_count - 1 : comment.likes_count + 1
        };
      }
      return comment;
    });

    set({ comments: updatedComments });
  }
}));
