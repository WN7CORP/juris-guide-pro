
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LegalArticle } from '@/services/legalCodeService';
import { supabase } from '@/integrations/supabase/client';

export type ArticleCache = {
  [tableName: string]: {
    allArticles: LegalArticle[];
    audioArticles: LegalArticle[];
    lastFetched: number;
    isFetching: boolean;
  };
};

export type LegalArticlesState = {
  articleCache: ArticleCache;
  selectedArticleId: string | null;
  cacheTTL: number; // Time to live in milliseconds
  
  // Actions
  setSelectedArticle: (articleId: string | null) => void;
  getArticles: (tableName: string) => Promise<LegalArticle[]>;
  getArticlesWithAudio: (tableName: string) => Promise<LegalArticle[]>;
  getCachedArticles: (tableName: string) => LegalArticle[] | null;
  getCachedArticlesWithAudio: (tableName: string) => LegalArticle[] | null;
  clearCache: (tableName?: string) => void;
};

export const useLegalArticlesStore = create<LegalArticlesState>()(
  persist(
    (set, get) => ({
      articleCache: {},
      selectedArticleId: null,
      cacheTTL: 5 * 60 * 1000, // 5 minutes cache by default
      
      setSelectedArticle: (articleId) => {
        set({ selectedArticleId: articleId });
      },
      
      getArticles: async (tableName) => {
        const { articleCache, cacheTTL } = get();
        const cache = articleCache[tableName];
        
        // Check if we have valid cached data
        if (
          cache && 
          cache.allArticles.length > 0 && 
          Date.now() - cache.lastFetched < cacheTTL
        ) {
          console.log(`Using cached articles for ${tableName}`);
          return cache.allArticles;
        }
        
        // Set fetching state
        set((state) => ({
          articleCache: {
            ...state.articleCache,
            [tableName]: {
              ...state.articleCache[tableName],
              isFetching: true,
            },
          },
        }));
        
        try {
          console.log(`Fetching articles from ${tableName}`);
          // Use the correct from() method with the tableName
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('id', { ascending: true });
            
          if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
          }
          
          // Process data with correct typing
          const processedData: LegalArticle[] = data?.map(article => ({
            id: article.id?.toString(),
            artigo: article.artigo,
            numero: article.numero,
            tecnica: article.tecnica,
            formal: article.formal,
            exemplo: article.exemplo,
            comentario_audio: article.comentario_audio
          })) || [];
          
          // Now check which articles have audio comments
          const articlesWithAudio = processedData.filter(
            article => article.comentario_audio && article.comentario_audio.trim() !== ''
          );
          
          console.log(`Found ${articlesWithAudio.length} articles with audio comments in ${tableName}`);
          
          // Update cache
          set((state) => ({
            articleCache: {
              ...state.articleCache,
              [tableName]: {
                allArticles: processedData,
                audioArticles: articlesWithAudio,
                lastFetched: Date.now(),
                isFetching: false,
              },
            },
          }));
          
          return processedData;
        } catch (error) {
          console.error(`Error in getArticles for ${tableName}:`, error);
          // Reset fetching state on error
          set((state) => ({
            articleCache: {
              ...state.articleCache,
              [tableName]: {
                ...state.articleCache[tableName],
                isFetching: false,
              },
            },
          }));
          return [];
        }
      },
      
      getArticlesWithAudio: async (tableName) => {
        const { articleCache, cacheTTL } = get();
        const cache = articleCache[tableName];
        
        // Check if we have valid cached audio articles
        if (
          cache && 
          cache.audioArticles.length > 0 && 
          Date.now() - cache.lastFetched < cacheTTL
        ) {
          console.log(`Using cached audio articles for ${tableName}`);
          return cache.audioArticles;
        }
        
        try {
          // Get all articles first (this will use cache if available)
          const allArticles = await get().getArticles(tableName);
          
          // Filter articles with audio comments
          const articlesWithAudio = allArticles.filter(
            article => article.comentario_audio && article.comentario_audio.trim() !== ''
          );
          
          // Update cache with audio articles
          set((state) => ({
            articleCache: {
              ...state.articleCache,
              [tableName]: {
                ...state.articleCache[tableName],
                audioArticles: articlesWithAudio,
                lastFetched: Date.now(),
              },
            },
          }));
          
          console.log(`Found ${articlesWithAudio.length} articles with audio comments in ${tableName}`);
          return articlesWithAudio;
        } catch (error) {
          console.error(`Error in getArticlesWithAudio for ${tableName}:`, error);
          return [];
        }
      },
      
      getCachedArticles: (tableName) => {
        const { articleCache, cacheTTL } = get();
        const cache = articleCache[tableName];
        
        if (
          cache && 
          cache.allArticles.length > 0 && 
          Date.now() - cache.lastFetched < cacheTTL
        ) {
          return cache.allArticles;
        }
        
        return null;
      },
      
      getCachedArticlesWithAudio: (tableName) => {
        const { articleCache, cacheTTL } = get();
        const cache = articleCache[tableName];
        
        if (
          cache && 
          cache.audioArticles.length > 0 && 
          Date.now() - cache.lastFetched < cacheTTL
        ) {
          return cache.audioArticles;
        }
        
        return null;
      },
      
      clearCache: (tableName) => {
        if (tableName) {
          set((state) => ({
            articleCache: {
              ...state.articleCache,
              [tableName]: {
                allArticles: [],
                audioArticles: [],
                lastFetched: 0,
                isFetching: false,
              },
            },
          }));
        } else {
          set({ articleCache: {} });
        }
      },
    }),
    {
      name: 'legal-articles-storage',
      partialize: (state) => ({
        articleCache: Object.fromEntries(
          Object.entries(state.articleCache).map(([key, value]) => [
            key,
            {
              allArticles: value.allArticles,
              audioArticles: value.audioArticles,
              lastFetched: value.lastFetched,
              isFetching: false, // Always reset fetching state on persist
            },
          ])
        ),
      }),
    }
  )
);
