
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

export const fetchLegalCode = async (tableName: string): Promise<LegalArticle[]> => {
  try {
    // Use any as a workaround for the complex type system of Supabase
    const { data, error } = await supabase
      .from(tableName)
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

// Function to search across all legal codes
export const searchAllLegalCodes = async (searchTerm: string): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }
  
  // This is a placeholder for a more efficient implementation
  // Ideally, we should perform a single query to search across all tables
  
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  
  return results;
};

// Function to get articles with audio comments
export const getArticlesWithAudioComments = async (): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  // This is a placeholder for a more efficient implementation
  // Ideally, this should query all tables at once or use a view
  
  return [];
};
