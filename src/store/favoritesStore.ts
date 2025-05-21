
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface FavoritesState {
  favorites: string[];
  addFavorite: (articleId: string) => void;
  removeFavorite: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
  toggleFavorite: (articleId: string, articleNumber?: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (articleId) => {
        set((state) => ({
          favorites: [...state.favorites, articleId]
        }));
      },
      removeFavorite: (articleId) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== articleId)
        }));
      },
      isFavorite: (articleId) => {
        return get().favorites.includes(articleId);
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
    }
  )
);
