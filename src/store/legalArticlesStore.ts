
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { LegalArticle } from '@/services/legalCodeService';
import type { PostgrestError } from '@supabase/supabase-js';

// Define um tipo genérico para tipos de tabela que é seguro para uso
type SafeTableName = string;

// Define o tipo específico para artigos com áudio
interface ArticleWithAudio {
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
  
  getArticles: (tableName: SafeTableName) => Promise<LegalArticle[]>;
  getArticlesWithAudio: (tableName: SafeTableName) => Promise<LegalArticle[]>;
  getCachedArticles: (tableName: SafeTableName) => LegalArticle[] | null;
  getCachedArticlesWithAudio: (tableName: SafeTableName) => LegalArticle[] | null;
  setSelectedArticle: (articleId: string | null) => void;
}

export const useLegalArticlesStore = create<LegalArticlesStore>((set, get) => ({
  articles: new Map<string, LegalArticle[]>(),
  articlesWithAudio: new Map<string, LegalArticle[]>(),
  selectedArticle: null,
  
  getArticles: async (tableName: SafeTableName) => {
    try {
      // Primeiro verifica se já temos os artigos em cache
      const cachedArticles = get().articles.get(tableName);
      if (cachedArticles) {
        console.log(`Using cached articles from ${tableName}`);
        return cachedArticles;
      }
      
      console.log(`Fetching articles from ${tableName}`);
      
      // Usa o tipo genérico para evitar erros de tipagem
      const { data, error } = await supabase
        .from(tableName)
        .select('id, artigo, numero, tecnica, formal, exemplo, comentario_audio')
        .order('id', { ascending: true });
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
      }
      
      // Converte os dados para o tipo LegalArticle
      const processedData: LegalArticle[] = (data || []).map((article: ArticleWithAudio) => ({
        id: article.id?.toString(),
        artigo: article.artigo,
        numero: article.numero,
        tecnica: article.tecnica,
        formal: article.formal,
        exemplo: article.exemplo,
        comentario_audio: article.comentario_audio
      }));
      
      // Atualiza o cache
      set((state) => ({
        articles: new Map(state.articles).set(tableName, processedData)
      }));
      
      return processedData;
    } catch (error) {
      console.error(`Error in getArticles for ${tableName}:`, error);
      throw error;
    }
  },
  
  getArticlesWithAudio: async (tableName: SafeTableName) => {
    try {
      // Primeiro verifica o cache
      const cachedArticles = get().articlesWithAudio.get(tableName);
      if (cachedArticles) {
        console.log(`Using cached audio articles from ${tableName}`);
        return cachedArticles;
      }
      
      console.log(`Fetching articles with audio from ${tableName}`);
      
      // Usa o tipo genérico para evitar erros de tipagem
      const { data, error } = await supabase
        .from(tableName)
        .select('id, artigo, numero, tecnica, formal, exemplo, comentario_audio')
        .not('comentario_audio', 'is', null)
        .order('id', { ascending: true });
      
      if (error) {
        console.error(`Error fetching ${tableName} with audio:`, error);
        throw new Error(`Failed to fetch ${tableName} with audio: ${error.message}`);
      }
      
      // Filtra artigos com comentário de áudio não vazio
      const articlesWithAudio = (data || [])
        .filter((article: ArticleWithAudio) => article.comentario_audio && article.comentario_audio.trim() !== '')
        .map((article: ArticleWithAudio) => ({
          id: article.id?.toString(),
          artigo: article.artigo,
          numero: article.numero,
          tecnica: article.tecnica,
          formal: article.formal,
          exemplo: article.exemplo,
          comentario_audio: article.comentario_audio
        }));
      
      // Atualiza o cache
      set((state) => ({
        articlesWithAudio: new Map(state.articlesWithAudio).set(tableName, articlesWithAudio)
      }));
      
      return articlesWithAudio;
    } catch (error) {
      console.error(`Error in getArticlesWithAudio for ${tableName}:`, error);
      return [];
    }
  },
  
  getCachedArticles: (tableName: SafeTableName) => {
    return get().articles.get(tableName) || null;
  },
  
  getCachedArticlesWithAudio: (tableName: SafeTableName) => {
    return get().articlesWithAudio.get(tableName) || null;
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
