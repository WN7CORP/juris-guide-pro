
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    category: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  isLiked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface CommunityState {
  posts: CommunityPost[];
  loading: boolean;
  initialized: boolean;
  fetchPosts: () => Promise<void>;
  createPost: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
}

const createMockPosts = (): CommunityPost[] => {
  console.log('🏗️ Criando posts mock da comunidade...');
  
  return [
    {
      id: '1',
      title: 'Dúvida sobre Direitos Fundamentais',
      content: 'Estou estudando o artigo 5º da Constituição e tenho uma dúvida sobre a aplicação prática dos direitos fundamentais. Alguém pode me ajudar com exemplos?',
      tags: ['artigo', 'ajuda'],
      author: {
        id: '1',
        name: 'Maria Silva',
        category: 'concurseiro'
      },
      likes_count: 5,
      comments_count: 3,
      isLiked: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Dica: Como memorizar artigos',
      content: 'Pessoal, uma dica que tem funcionado comigo é criar mapas mentais para cada capítulo. Associo as cores com os temas e isso ajuda muito na memorização!',
      tags: ['dicas'],
      author: {
        id: '2',
        name: 'João Santos',
        category: 'advogado'
      },
      likes_count: 12,
      comments_count: 7,
      isLiked: true,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Discussão: Reforma do Código Penal',
      content: 'O que vocês acham das propostas de reforma do Código Penal? Como isso pode impactar a aplicação da lei na prática?',
      tags: ['discussão'],
      author: {
        id: '3',
        name: 'Ana Costa',
        category: 'estudante'
      },
      likes_count: 8,
      comments_count: 15,
      isLiked: false,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      loading: false,
      initialized: false,

      fetchPosts: async () => {
        console.log('🔄 Iniciando fetchPosts...');
        const { posts, initialized } = get();
        
        // Se já temos posts e já inicializamos, não buscar novamente
        if (posts.length > 0 && initialized) {
          console.log('✅ Posts já carregados do cache:', posts.length);
          return;
        }

        set({ loading: true });
        console.log('⏳ Carregando posts da comunidade...');
        
        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mockPosts = createMockPosts();
          console.log('✅ Posts criados com sucesso:', mockPosts.length);
          
          set({ 
            posts: mockPosts, 
            loading: false,
            initialized: true
          });
          
          console.log('📦 Posts salvos no store');
        } catch (error) {
          console.error('❌ Erro ao carregar posts:', error);
          set({ loading: false });
          throw error;
        }
      },

      createPost: async (data: { title: string; content: string; tags: string[] }) => {
        console.log('📝 Criando novo post:', data.title);
        const { posts } = get();
        
        const newPost: CommunityPost = {
          id: Date.now().toString(),
          title: data.title,
          content: data.content,
          tags: data.tags,
          author: {
            id: '1', // Mock user ID
            name: 'Usuário Demo',
            category: 'concurseiro'
          },
          likes_count: 0,
          comments_count: 0,
          isLiked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set({ posts: [newPost, ...posts] });
        console.log('✅ Post criado e adicionado ao store');
      },

      likePost: async (postId: string) => {
        console.log('👍 Curtindo/descurtindo post:', postId);
        const { posts } = get();
        
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            const newLikedState = !post.isLiked;
            console.log(`Post ${postId} ${newLikedState ? 'curtido' : 'descurtido'}`);
            return {
              ...post,
              isLiked: newLikedState,
              likes_count: newLikedState ? post.likes_count + 1 : post.likes_count - 1
            };
          }
          return post;
        });

        set({ posts: updatedPosts });
      },

      addComment: async (postId: string, content: string) => {
        console.log('💬 Adicionando comentário ao post:', postId);
        const { posts } = get();
        
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments_count: post.comments_count + 1
            };
          }
          return post;
        });

        set({ posts: updatedPosts });
        console.log('✅ Comentário adicionado');
      }
    }),
    {
      name: 'community-storage',
      partialize: (state) => ({
        posts: state.posts,
        initialized: state.initialized
      })
    }
  )
);
