
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
  lastFetch: number | null;
  fetchPosts: () => Promise<void>;
  createPost: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const createMockPosts = (): CommunityPost[] => {
  console.log('🏗️ Criando posts mock da comunidade...');
  
  return [
    {
      id: '1',
      title: 'Dúvida sobre Direitos Fundamentais',
      content: 'Estou estudando o artigo 5º da Constituição e tenho uma dúvida sobre a aplicação prática dos direitos fundamentais. Alguém pode me ajudar com exemplos?\n\nEspecificamente sobre a inviolabilidade do domicílio e quando a polícia pode entrar sem mandado.',
      tags: ['constituicao', 'direitos-fundamentais', 'duvida'],
      author: {
        id: '1',
        name: 'Maria Silva',
        category: 'concurseiro'
      },
      likes_count: 8,
      comments_count: 5,
      isLiked: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Dica: Como memorizar artigos',
      content: 'Pessoal, uma dica que tem funcionado comigo é criar mapas mentais para cada capítulo. Associo as cores com os temas e isso ajuda muito na memorização!\n\nTambém uso flashcards digitais para revisar os artigos mais importantes. Alguém mais usa essa técnica?',
      tags: ['dicas', 'estudo', 'memorizacao'],
      author: {
        id: '2',
        name: 'João Santos',
        category: 'advogado'
      },
      likes_count: 15,
      comments_count: 9,
      isLiked: true,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Discussão: Reforma do Código Penal',
      content: 'O que vocês acham das propostas de reforma do Código Penal? Como isso pode impactar a aplicação da lei na prática?\n\nTenho visto algumas propostas interessantes sobre crimes digitais e violência doméstica.',
      tags: ['discussao', 'codigo-penal', 'reforma'],
      author: {
        id: '3',
        name: 'Ana Costa',
        category: 'estudante'
      },
      likes_count: 12,
      comments_count: 18,
      isLiked: false,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'CDC: Direitos do Consumidor Online',
      content: 'Com o crescimento das compras online, quais são os principais direitos do consumidor que devemos conhecer?\n\nJá tive problemas com produtos defeituosos comprados pela internet e gostaria de entender melhor meus direitos.',
      tags: ['cdc', 'consumidor', 'ecommerce'],
      author: {
        id: '4',
        name: 'Pedro Oliveira',
        category: 'concurseiro'
      },
      likes_count: 7,
      comments_count: 4,
      isLiked: false,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'ECA: Proteção de Menores na Internet',
      content: 'Como o Estatuto da Criança e do Adolescente se aplica aos crimes cibernéticos envolvendo menores?\n\nEssa é uma área que tem crescido muito e gostaria de entender melhor a aplicação prática.',
      tags: ['eca', 'menores', 'crimes-digitais'],
      author: {
        id: '5',
        name: 'Carla Fernandes',
        category: 'advogado'
      },
      likes_count: 11,
      comments_count: 7,
      isLiked: true,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      loading: false,
      initialized: false,
      lastFetch: null,

      fetchPosts: async () => {
        console.log('🔄 Iniciando fetchPosts...');
        const { posts, initialized, lastFetch } = get();
        
        // Verificar se já temos posts no cache e se foram carregados recentemente (últimos 5 minutos)
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
        
        if (posts.length > 0 && initialized && lastFetch && (now - lastFetch) < CACHE_DURATION) {
          console.log('✅ Posts já carregados do cache recente:', posts.length);
          return;
        }

        set({ loading: true });
        console.log('⏳ Carregando posts da comunidade...');
        
        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockPosts = createMockPosts();
          console.log('✅ Posts criados com sucesso:', mockPosts.length);
          
          set({ 
            posts: mockPosts, 
            loading: false,
            initialized: true,
            lastFetch: now
          });
          
          console.log('📦 Posts salvos no store com timestamp:', new Date(now));
        } catch (error) {
          console.error('❌ Erro ao carregar posts:', error);
          set({ loading: false });
          throw error;
        }
      },

      refreshPosts: async () => {
        console.log('🔄 Forçando refresh dos posts...');
        set({ 
          loading: true,
          lastFetch: null // Força o reload
        });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockPosts = createMockPosts();
          
          set({ 
            posts: mockPosts, 
            loading: false,
            initialized: true,
            lastFetch: Date.now()
          });
          
          console.log('✅ Posts atualizados com sucesso');
        } catch (error) {
          console.error('❌ Erro ao atualizar posts:', error);
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
            id: '1',
            name: 'Usuário Demo',
            category: 'concurseiro'
          },
          likes_count: 0,
          comments_count: 0,
          isLiked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set({ 
          posts: [newPost, ...posts],
          lastFetch: Date.now() // Atualiza timestamp
        });
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
              likes_count: newLikedState ? post.likes_count + 1 : post.likes_count - 1,
              updated_at: new Date().toISOString()
            };
          }
          return post;
        });

        set({ 
          posts: updatedPosts,
          lastFetch: Date.now() // Atualiza timestamp
        });
      },

      addComment: async (postId: string, content: string) => {
        console.log('💬 Adicionando comentário ao post:', postId);
        const { posts } = get();
        
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments_count: post.comments_count + 1,
              updated_at: new Date().toISOString()
            };
          }
          return post;
        });

        set({ 
          posts: updatedPosts,
          lastFetch: Date.now() // Atualiza timestamp
        });
        console.log('✅ Comentário adicionado');
      }
    }),
    {
      name: 'community-storage',
      partialize: (state) => ({
        posts: state.posts,
        initialized: state.initialized,
        lastFetch: state.lastFetch
      })
    }
  )
);
