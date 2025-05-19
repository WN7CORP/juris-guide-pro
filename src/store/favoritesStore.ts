
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (articleId: string) => void;
  removeFavorite: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
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
      }
    }),
    {
      name: 'vademecum-favorites',
    }
  )
);
