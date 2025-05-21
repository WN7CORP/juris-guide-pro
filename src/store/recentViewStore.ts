
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Article {
  id: string;
  codeId: string;
  codeTitle: string;
  articleNumber: string;
  content: string;
  viewedAt: number;
}

interface RecentViewState {
  recentArticles: Article[];
  addRecentArticle: (article: Omit<Article, 'viewedAt'>) => void;
  clearRecentArticles: () => void;
}

export const useRecentViewStore = create<RecentViewState>()(
  persist(
    (set, get) => ({
      recentArticles: [],
      addRecentArticle: (article) => {
        const { recentArticles } = get();
        
        // Check if article already exists and remove it
        const filteredArticles = recentArticles.filter(
          item => !(item.codeId === article.codeId && item.id === article.id)
        );
        
        // Add article at the beginning with current timestamp
        const newArticle = { ...article, viewedAt: Date.now() };
        
        // Limit to 10 most recent articles
        set({ 
          recentArticles: [newArticle, ...filteredArticles].slice(0, 10) 
        });
      },
      clearRecentArticles: () => set({ recentArticles: [] }),
    }),
    {
      name: 'recent-articles-storage',
    }
  )
);
