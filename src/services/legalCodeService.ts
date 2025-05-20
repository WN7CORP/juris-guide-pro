
import { tableNameMap } from "@/utils/tableMapping";

// Define type for table names
export type LegalCodeTable = keyof typeof tableNameMap;

// Define types for legal article structure
export interface LegalArticle {
  id?: number;
  numero?: string;
  texto?: string;
  artigo?: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario?: string;
  comentario_audio?: string;
  titulo?: string;
  capitulo?: string;
  secao?: string;
  subsecao?: string;
  livro?: string;
  parte?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LegalCode {
  articles: LegalArticle[];
  totalCount: number;
}

// Cache structure to avoid redundant API calls
const cache: Record<string, LegalCode> = {};

/**
 * Fetches a legal code from the database
 */
export const fetchLegalCode = async (tableName: keyof typeof tableNameMap): Promise<LegalCode> => {
  // Check if data is already in cache
  if (cache[tableName]) {
    return cache[tableName];
  }

  try {
    // Example API base URL (replace with actual API URL)
    const baseUrl = 'https://lawbooks-api.vercel.app/api';
    const response = await fetch(`${baseUrl}/articles?table=${tableName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles from ${tableName}`);
    }
    
    const data = await response.json();
    
    // Process the data
    const legalCode: LegalCode = {
      articles: data.articles || [],
      totalCount: data.totalCount || 0
    };
    
    // Store in cache
    cache[tableName] = legalCode;
    
    return legalCode;
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    // Return empty data on error
    return { articles: [], totalCount: 0 };
  }
};

/**
 * Fetches a single article by ID from a specific table
 */
export const fetchArticleById = async (tableName: keyof typeof tableNameMap, id: number | string): Promise<LegalArticle | null> => {
  try {
    // Try to get from cache first
    if (cache[tableName]) {
      const cachedArticle = cache[tableName].articles.find(article => 
        article.id === (typeof id === 'string' ? parseInt(id) : id)
      );
      
      if (cachedArticle) {
        return cachedArticle;
      }
    }
    
    // If not in cache, fetch entire code (more efficient than single article in most cases)
    const legalCode = await fetchLegalCode(tableName);
    
    // Find the article
    const article = legalCode.articles.find(article => 
      article.id === (typeof id === 'string' ? parseInt(id) : id)
    );
    
    return article || null;
  } catch (error) {
    console.error(`Error fetching article ${id} from ${tableName}:`, error);
    return null;
  }
};

/**
 * Searches articles in a specific table
 */
export const searchArticles = async (
  tableName: keyof typeof tableNameMap,
  query: string
): Promise<LegalArticle[]> => {
  try {
    // Fetch the legal code
    const legalCode = await fetchLegalCode(tableName);
    
    // Simple search implementation
    const lowercaseQuery = query.toLowerCase().trim();
    
    if (!lowercaseQuery) {
      return legalCode.articles.slice(0, 20); // Return first 20 articles if query is empty
    }
    
    // Search in text and number
    return legalCode.articles.filter(article => {
      const matchesText = (article.texto?.toLowerCase().includes(lowercaseQuery)) || 
                          (article.artigo?.toLowerCase().includes(lowercaseQuery));
      const matchesNumber = article.numero?.toLowerCase().includes(lowercaseQuery);
      const matchesTitle = article.titulo?.toLowerCase().includes(lowercaseQuery);
      
      return matchesText || matchesNumber || matchesTitle;
    });
  } catch (error) {
    console.error(`Error searching ${tableName}:`, error);
    return [];
  }
};
