
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { LegalArticle, LegalCodeTable } from '@/services/legalCodeService';
import type { PostgrestResponse } from '@supabase/supabase-js';

// Define the type for articles with audio
interface ArticleResponse {
  id: string | number;
  artigo: string;
  numero?: string; 
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string;
}

interface LegalArticlesStore {
  articles: Map<string, LegalArticle[]>;
  articlesWithAudio: Map<string, LegalArticle[]>;
  selectedArticle: string | null;
  
  getArticles: (tableName: LegalCodeTable) => Promise<LegalArticle[]>;
  getArticlesWithAudio: (tableName: LegalCodeTable) => Promise<LegalArticle[]>;
  getCachedArticles: (tableName: string) => LegalArticle[] | null;
  getCachedArticlesWithAudio: (tableName: string) => LegalArticle[] | null;
  setSelectedArticle: (articleId: string | null) => void;
}

export const useLegalArticlesStore = create<LegalArticlesStore>((set, get) => ({
  articles: new Map<string, LegalArticle[]>(),
  articlesWithAudio: new Map<string, LegalArticle[]>(),
  selectedArticle: null,
  
  getArticles: async (tableName: LegalCodeTable) => {
    try {
      // Check cache first
      const cachedArticles = get().articles.get(tableName);
      if (cachedArticles) {
        console.log(`Using cached articles from ${tableName}`);
        return cachedArticles;
      }
      
      console.log(`Fetching articles from ${tableName}`);
      
      // Use type assertion to help TypeScript understand this is a valid table name
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, artigo, numero, tecnica, formal, exemplo, comentario_audio')
        .order('id', { ascending: true }) as PostgrestResponse<ArticleResponse>;
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
      }
      
      // Process data and validate audio URLs
      const processedData: LegalArticle[] = (data || []).map((article: ArticleResponse) => {
        const hasValidAudio = article.comentario_audio && 
                            article.comentario_audio.trim() !== '' && 
                            (article.comentario_audio.startsWith('http') || article.comentario_audio.startsWith('data:'));
        
        if (hasValidAudio) {
          console.log(`Article ${article.numero || article.id} has valid audio URL: ${article.comentario_audio}`);
        }
        
        return {
          id: article.id?.toString(),
          artigo: article.artigo,
          numero: article.numero,
          tecnica: article.tecnica,
          formal: article.formal,
          exemplo: article.exemplo,
          comentario_audio: article.comentario_audio
        };
      });
      
      // Check for duplicates
      const articleIds = new Set<string>();
      const duplicates = processedData.filter(article => {
        if (articleIds.has(article.id!)) {
          console.warn(`Found duplicate article ID: ${article.id}`);
          return true;
        }
        articleIds.add(article.id!);
        return false;
      });
      
      if (duplicates.length > 0) {
        console.warn(`Found ${duplicates.length} duplicate articles in ${tableName}`);
      }
      
      // Update cache
      set((state) => ({
        articles: new Map(state.articles).set(tableName, processedData)
      }));
      
      return processedData;
    } catch (error) {
      console.error(`Error in getArticles for ${tableName}:`, error);
      throw error;
    }
  },
  
  getArticlesWithAudio: async (tableName: LegalCodeTable) => {
    try {
      // Check cache first
      const cachedArticles = get().articlesWithAudio.get(tableName);
      if (cachedArticles) {
        console.log(`Using cached audio articles from ${tableName}`);
        return cachedArticles;
      }
      
      console.log(`Fetching articles with audio from ${tableName}`);
      
      // Use type assertion for TypeScript
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, artigo, numero, tecnica, formal, exemplo, comentario_audio')
        .not('comentario_audio', 'is', null)
        .order('id', { ascending: true }) as PostgrestResponse<ArticleResponse>;
      
      if (error) {
        console.error(`Error fetching ${tableName} with audio:`, error);
        throw new Error(`Failed to fetch ${tableName} with audio: ${error.message}`);
      }
      
      // More strict filtering for articles with valid audio URLs
      const articlesWithAudio = (data || [])
        .filter((article: ArticleResponse) => {
          const hasAudio = article.comentario_audio && 
                         article.comentario_audio.trim() !== '' && 
                         (article.comentario_audio.startsWith('http') || article.comentario_audio.startsWith('data:'));
          
          if (hasAudio) {
            console.log(`Valid audio URL found for article ${article.numero || article.id}: ${article.comentario_audio}`);
          } else if (article.comentario_audio) {
            console.log(`Invalid audio URL for article ${article.numero || article.id}: ${article.comentario_audio}`);
          }
          
          return hasAudio;
        })
        .map((article: ArticleResponse) => ({
          id: article.id?.toString(),
          artigo: article.artigo,
          numero: article.numero,
          tecnica: article.tecnica,
          formal: article.formal,
          exemplo: article.exemplo,
          comentario_audio: article.comentario_audio
        }));
      
      console.log(`Found ${articlesWithAudio.length} articles with valid audio in ${tableName}`);
      
      // Log articles with audio for debugging
      articlesWithAudio.forEach(article => {
        console.log(`Article ${article.numero || article.id} (ID: ${article.id}) has audio: ${article.comentario_audio}`);
      });
      
      // Update cache
      set((state) => ({
        articlesWithAudio: new Map(state.articlesWithAudio).set(tableName, articlesWithAudio)
      }));
      
      return articlesWithAudio;
    } catch (error) {
      console.error(`Error in getArticlesWithAudio for ${tableName}:`, error);
      return [];
    }
  },
  
  getCachedArticles: (tableName: string) => {
    return get().articles.get(tableName as any) || null;
  },
  
  getCachedArticlesWithAudio: (tableName: string) => {
    return get().articlesWithAudio.get(tableName as any) || null;
  },
  
  setSelectedArticle: (articleId) => {
    set({ selectedArticle: articleId });
  }
}));

// Adiciona animação de pulso lenta para CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-slow {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
    
    .animate-pulse-slow {
      animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;
  document.head.appendChild(style);
}
