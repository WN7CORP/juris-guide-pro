import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentArticle = {
  id: string;
  title: string;
  number: string;
  codeId: string;
  codeName: string;
  timestamp: number;
};

type RecentArticlesState = {
  recentArticles: RecentArticle[];
  addRecentArticle: (article: Omit<RecentArticle, "timestamp">) => void;
  clearRecentArticles: () => void;
};

export const useRecentArticlesStore = create<RecentArticlesState>()(
  persist(
    (set) => ({
      recentArticles: [],
      addRecentArticle: (article) => {
        set((state) => {
          // Filter out duplicates of the same article
          const filteredArticles = state.recentArticles.filter(
            (a) => a.id !== article.id
          );
          
          // Add new article with timestamp to the beginning
          const newArticle = { ...article, timestamp: Date.now() };
          
          // Keep only the 10 most recent articles
          return {
            recentArticles: [newArticle, ...filteredArticles].slice(0, 10),
          };
        });
      },
      clearRecentArticles: () => {
        set({ recentArticles: [] });
      },
    }),
    {
      name: "recent-articles-storage",
    }
  )
);
