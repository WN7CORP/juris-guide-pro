
import { supabase } from "@/integrations/supabase/client";

export interface LegalArticle {
  id?: string | number;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string;
}

// Função para fazer cast seguro do nome da tabela para fins de tipagem
function safeTableCast(tableName: string) {
  // Usamos 'as any' aqui para contornar a limitação de tipagem do Supabase
  // que exige tipos literais para nomes de tabela
  return tableName as any;
}

export const fetchLegalCode = async (tableName: string): Promise<LegalArticle[]> => {
  try {
    // Usamos o método seguro de cast para contornar a verificação de tipos
    const { data, error } = await supabase
      .from(safeTableCast(tableName))
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
    }

    // Convert number ids to strings if needed and process data
    const processedData = data?.map(article => {
      // Handle data coming from Supabase safely with proper type assertions
      const articleData = article as Record<string, any>;
      
      const processedArticle: LegalArticle = {
        id: articleData.id?.toString() || '',
        artigo: articleData.artigo || '',
        numero: articleData.numero,
        tecnica: articleData.tecnica,
        formal: articleData.formal,
        exemplo: articleData.exemplo,
        comentario_audio: articleData.comentario_audio
      };
      
      return processedArticle;
    }) || [];
    
    console.log(`Total articles in ${tableName}:`, processedData.length);
    return processedData;
  } catch (err) {
    console.error(`Failed to fetch ${tableName}:`, err);
    return [];
  }
};

// Enhanced function to search across all legal codes
export const searchAllLegalCodes = async (
  searchTerm: string,
  tableNames: string[],
  options: { 
    searchContent?: boolean,
    searchExplanations?: boolean,
    searchExamples?: boolean,
    limit?: number
  } = {}
): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  const searchLimit = options.limit || 10; // Default limit per table
  
  // Process tables in parallel for better performance
  const searchPromises = tableNames.map(async (tableName) => {
    try {
      // Create a filter for the search
      let query = supabase
        .from(safeTableCast(tableName))
        .select('*');
      
      // Always search in artigo field
      query = query.ilike('artigo', `%${normalizedSearchTerm}%`);
      
      // Add optional filters based on options
      if (options.searchExplanations) {
        query = query.or(`tecnica.ilike.%${normalizedSearchTerm}%,formal.ilike.%${normalizedSearchTerm}%`);
      }
      
      if (options.searchExamples) {
        query = query.or(`exemplo.ilike.%${normalizedSearchTerm}%`);
      }
      
      // Apply limit
      query = query.limit(searchLimit);

      const { data, error } = await query;
      
      if (error) {
        console.error(`Error searching in ${tableName}:`, error);
        return null;
      }
      
      if (data && data.length > 0) {
        const articles = data.map(article => {
          const articleData = article as Record<string, any>;
          
          const processedArticle: LegalArticle = {
            id: articleData.id?.toString() || '',
            artigo: articleData.artigo || '',
            numero: articleData.numero,
            tecnica: articleData.tecnica,
            formal: articleData.formal,
            exemplo: articleData.exemplo,
            comentario_audio: articleData.comentario_audio
          };
          
          return processedArticle;
        });
        
        return {
          codeId: tableName,
          articles
        };
      }
      
      return null;
    } catch (err) {
      console.error(`Failed to search in ${tableName}:`, err);
      return null;
    }
  });
  
  // Wait for all search promises to complete
  const searchResults = await Promise.all(searchPromises);
  
  // Filter out null results and add to the results array
  searchResults.forEach(result => {
    if (result) {
      results.push(result);
    }
  });
  
  return results;
};

// Enhanced function to get articles with audio comments
export const getArticlesWithAudioComments = async (tableNames: string[]): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  
  // Process tables in parallel for better performance
  const audioPromises = tableNames.map(async (tableName) => {
    try {
      const { data, error } = await supabase
        .from(safeTableCast(tableName))
        .select('*')
        .not('comentario_audio', 'is', null)
        .order('id', { ascending: true });
      
      if (error) {
        console.error(`Error fetching audio comments from ${tableName}:`, error);
        return null;
      }
      
      if (data && data.length > 0) {
        const articles = data.map(article => {
          const articleData = article as Record<string, any>;
          
          const processedArticle: LegalArticle = {
            id: articleData.id?.toString() || '',
            artigo: articleData.artigo || '',
            numero: articleData.numero,
            tecnica: articleData.tecnica,
            formal: articleData.formal,
            exemplo: articleData.exemplo,
            comentario_audio: articleData.comentario_audio
          };
          
          return processedArticle;
        });
        
        return {
          codeId: tableName,
          articles
        };
      }
      
      return null;
    } catch (err) {
      console.error(`Failed to fetch audio comments from ${tableName}:`, err);
      return null;
    }
  });
  
  // Wait for all promises to complete
  const audioResults = await Promise.all(audioPromises);
  
  // Filter out null results and add to the results array
  audioResults.forEach(result => {
    if (result) {
      results.push(result);
    }
  });
  
  return results;
};
