
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  category: 'concurseiro' | 'estudante' | 'advogado';
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface UserStats {
  articles_read: number;
  articles_favorited: number;
  study_streak: number;
  total_study_time: number;
}

interface AuthState {
  user: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; category: string }) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateStats: (data: Partial<UserStats>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      stats: null,
      loading: false,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          // Simulação de login - em produção, usar Supabase Auth
          // Para demo, vamos simular um usuário
          const mockUser: UserProfile = {
            id: '1',
            name: 'Usuário Demo',
            email: email,
            category: 'concurseiro',
            created_at: new Date().toISOString()
          };
          
          const mockStats: UserStats = {
            articles_read: 25,
            articles_favorited: 8,
            study_streak: 3,
            total_study_time: 7200 // 2 horas em segundos
          };

          set({ 
            user: mockUser, 
            stats: mockStats,
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, userData: { name: string; category: string }) => {
        set({ loading: true });
        
        try {
          // Simulação de cadastro - em produção, usar Supabase Auth
          const newUser: UserProfile = {
            id: Date.now().toString(),
            name: userData.name,
            email: email,
            category: userData.category as 'concurseiro' | 'estudante' | 'advogado',
            created_at: new Date().toISOString()
          };
          
          const initialStats: UserStats = {
            articles_read: 0,
            articles_favorited: 0,
            study_streak: 0,
            total_study_time: 0
          };

          set({ 
            user: newUser, 
            stats: initialStats,
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: () => {
        set({ 
          user: null, 
          stats: null,
          isAuthenticated: false 
        });
      },

      updateProfile: (data: Partial<UserProfile>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      updateStats: (data: Partial<UserStats>) => {
        const { stats } = get();
        if (stats) {
          set({ stats: { ...stats, ...data } });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        stats: state.stats,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
