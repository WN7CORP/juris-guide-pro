import { supabase } from "@/integrations/supabase/client";
import { LegalCodeTable } from "@/utils/tableMapping";

export interface LegalArticle {
  id?: string | number;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string;
}

export const fetchLegalCode = async (tableName: LegalCodeTable): Promise<LegalArticle[]> => {
  // Use proper quotes around table names with special characters
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  // Convert number ids to strings if needed and log for debugging
  const processedData = data?.map(article => {
    // Handle data coming from Supabase safely with proper type assertions
    // Type assertion to make TypeScript aware of the shape of the data
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
    
    // Log articles with audio comments for debugging
    if (processedArticle.comentario_audio) {
      console.log(`Article with audio found:`, processedArticle);
    }
    
    return processedArticle;
  }) || [];
  
  console.log(`Total articles in ${tableName}:`, processedData.length);
  return processedData;
};

// Function to search across all legal codes
export const searchAllLegalCodes = async (searchTerm: string): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }
  
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  
  // This is a placeholder for future database-level search implementation
  // Ideally, this should be done with a single query at the database level
  
  return results;
};

// Function to get articles with audio comments
export const getArticlesWithAudioComments = async (): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  // This is a placeholder for a more efficient implementation
  // Ideally, this should query all tables at once or use a view
  
  return [];
};
