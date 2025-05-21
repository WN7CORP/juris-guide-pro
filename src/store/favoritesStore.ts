
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface FavoritesState {
  favorites: string[];
  addFavorite: (articleId: string) => void;
  removeFavorite: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
  toggleFavorite: (articleId: string, articleNumber?: string) => void;
  normalizeId: (id: string | number) => string;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      // Normalize IDs to string format for consistent comparison
      normalizeId: (id) => {
        return id.toString();
      },
      
      addFavorite: (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        console.log('Adding article to favorites:', normalizedId);
        set((state) => ({
          favorites: [...state.favorites, normalizedId]
        }));
      },
      
      removeFavorite: (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        console.log('Removing article from favorites:', normalizedId);
        set((state) => ({
          favorites: state.favorites.filter(id => id !== normalizedId)
        }));
      },
      
      isFavorite: (articleId) => {
        const normalizedId = get().normalizeId(articleId);
        return get().favorites.includes(normalizedId);
      },
      
      toggleFavorite: (articleId, articleNumber) => {
        const isFavorite = get().isFavorite(articleId);
        
        if (isFavorite) {
          get().removeFavorite(articleId);
          toast.success(`Artigo ${articleNumber || ''} removido dos favoritos`, {
            position: 'bottom-center',
            duration: 2000,
          });
        } else {
          get().addFavorite(articleId);
          toast.success(`Artigo ${articleNumber || ''} adicionado aos favoritos`, {
            position: 'bottom-center', 
            duration: 2000,
          });
        }
      }
    }),
    {
      name: 'vademecum-favorites',
      version: 1,
    }
  )
);
