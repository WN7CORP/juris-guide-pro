import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FavoritesState {
  favorites: string[];
  loading: boolean;
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  toggleFavorite: (articleId: string, articleNumber?: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  migrateFavoritesFromLocalStorage: () => Promise<void>;
  normalizeId: (id: string | number) => string;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      loading: false,
      
      // Normalize IDs to string format for consistent comparison
      normalizeId: (id) => {
        return id.toString();
      },

      loadFavorites: async () => {
        try {
          set({ loading: true });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('No user found, keeping localStorage favorites');
            set({ loading: false });
            return;
          }

          const { data, error } = await supabase
            .from('user_favorites')
            .select('article_id')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error loading favorites:', error);
            // Keep localStorage data on error
            set({ loading: false });
            return;
          }

          const favoriteIds = data?.map(f => f.article_id) || [];
          console.log('Loaded favorites from database:', favoriteIds);
          
          set({ favorites: favoriteIds, loading: false });
        } catch (error) {
          console.error('Error in loadFavorites:', error);
          set({ loading: false });
        }
      },

      migrateFavoritesFromLocalStorage: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { favorites } = get();
          if (favorites.length === 0) return;

          console.log('Migrating favorites to database:', favorites);

          // Check which favorites already exist in database
          const { data: existingFavorites, error: checkError } = await supabase
            .from('user_favorites')
            .select('article_id')
            .eq('user_id', user.id);

          if (checkError) {
            console.error('Error checking existing favorites:', checkError);
            return;
          }

          const existingIds = existingFavorites?.map(f => f.article_id) || [];
          const newFavorites = favorites.filter(id => !existingIds.includes(id));

          if (newFavorites.length > 0) {
            const favoritesToInsert = newFavorites.map(articleId => ({
              user_id: user.id,
              article_id: articleId,
            }));

            const { error: insertError } = await supabase
              .from('user_favorites')
              .insert(favoritesToInsert);

            if (insertError) {
              console.error('Error migrating favorites:', insertError);
            } else {
              console.log('Successfully migrated favorites to database');
            }
          }
        } catch (error) {
          console.error('Error in migrateFavoritesFromLocalStorage:', error);
        }
      },
      
      addFavorite: async (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        console.log('Adding article to favorites:', normalizedId);
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from('user_favorites')
              .insert({
                user_id: user.id,
                article_id: normalizedId,
              });

            if (error && error.code !== '23505') { // 23505 = unique constraint violation
              console.error('Error adding favorite:', error);
              throw error;
            }
          }

          set((state) => ({
            favorites: [...state.favorites, normalizedId]
          }));
        } catch (error) {
          console.error('Error in addFavorite:', error);
          // Fallback to localStorage only
          set((state) => ({
            favorites: [...state.favorites, normalizedId]
          }));
        }
      },
      
      removeFavorite: async (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        console.log('Removing article from favorites:', normalizedId);
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from('user_favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('article_id', normalizedId);

            if (error) {
              console.error('Error removing favorite:', error);
              throw error;
            }
          }

          set((state) => ({
            favorites: state.favorites.filter(id => id !== normalizedId)
          }));
        } catch (error) {
          console.error('Error in removeFavorite:', error);
          // Fallback to localStorage only
          set((state) => ({
            favorites: state.favorites.filter(id => id !== normalizedId)
          }));
        }
      },
      
      isFavorite: (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        return get().favorites.includes(normalizedId);
      },
      
      toggleFavorite: async (articleId, articleNumber) => {
        const isFavorite = get().isFavorite(articleId);
        
        if (isFavorite) {
          await get().removeFavorite(articleId);
          toast.success(`Artigo ${articleNumber || ''} removido dos favoritos`, {
            position: 'bottom-center',
            duration: 2000,
          });
        } else {
          await get().addFavorite(articleId);
          toast.success(`Artigo ${articleNumber || ''} adicionado aos favoritos`, {
            position: 'bottom-center', 
            duration: 2000,
          });
        }
      }
    }),
    {
      name: 'vademecum-favorites',
      version: 2,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Load favorites from database when store is rehydrated
          state.loadFavorites().then(() => {
            // Migrate localStorage data to database if needed
            state.migrateFavoritesFromLocalStorage();
          });
        }
      },
    }
  )
);
