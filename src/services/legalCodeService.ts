
import { supabase } from "@/integrations/supabase/client";

export interface LegalArticle {
  id?: string | number; // Changed to accept both string and number
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string; // Property for audio comments
  artigo_audio?: string; // New field for Código Penal table
}

// Define the raw database record type that includes all possible fields
interface DatabaseArticle {
  id: number | string;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string;
  artigo_audio?: string;
  [key: string]: any; // Allow for any additional fields
}

export const fetchCodigoCivil = async (): Promise<LegalArticle[]> => {
  const { data, error } = await supabase
    .from('Código_Civil')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching Código Civil:", error);
    throw new Error(`Failed to fetch Código Civil: ${error.message}`);
  }

  // Convert number ids to strings if needed
  return data?.map(article => ({
    ...article,
    id: article.id?.toString() // Convert id to string if needed
  })) || [];
};

// Use a type-safe approach for table names
type LegalCodeTable = 'Código_Civil' | 'Código_Penal' | 'Código_de_Processo_Civil' | 
  'Código_de_Processo_Penal' | 'Código_Tributário_Nacional' | 'Código_de_Defesa_do_Consumidor' | 
  'Código_de_Trânsito_Brasileiro' | 'Código_Eleitoral' | 'Constituicao_Federal';

export const fetchLegalCode = async (tableName: LegalCodeTable): Promise<LegalArticle[]> => {
  console.log(`Fetching articles from ${tableName}`);
  
  // Use proper quotes around table names with special characters
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  // Enhanced logging to debug audio comments
  console.log(`Raw data from ${tableName}:`, data?.slice(0, 3));
  
  // Check for both audio comment fields - cast data to DatabaseArticle
  const articlesWithAudio = data?.filter(article => {
    const typedArticle = article as DatabaseArticle;
    return typedArticle.comentario_audio || typedArticle.artigo_audio;
  });
  
  console.log(`Articles with audio in ${tableName}:`, articlesWithAudio?.length || 0);
  
  if (articlesWithAudio?.length) {
    console.log(`First article with audio:`, articlesWithAudio[0]);
  } else {
    console.log(`No articles with audio found in ${tableName}`);
  }

  // Convert number ids to strings if needed and handle audio comments
  const processedData = data?.map(article => {
    // Cast to properly typed object first
    const typedArticle = article as DatabaseArticle;
    
    // Create a properly typed LegalArticle object
    const processed: LegalArticle = {
      ...article,
      id: typedArticle.id?.toString(), // Convert id to string if needed
      artigo: typedArticle.artigo,
      numero: typedArticle.numero,
      tecnica: typedArticle.tecnica,
      formal: typedArticle.formal,
      exemplo: typedArticle.exemplo,
      // Map both potential audio fields to comentario_audio for consistent usage
      comentario_audio: typedArticle.comentario_audio || typedArticle.artigo_audio
    };
    
    // Log articles with audio comments for debugging
    if (processed.comentario_audio) {
      console.log(`Article ${processed.numero || processed.id} has audio comment URL:`, processed.comentario_audio);
    }
    
    return processed;
  }) || [];
  
  console.log(`Total articles in ${tableName}:`, processedData.length);
  const audioCount = processedData.filter(a => a.comentario_audio).length;
  console.log(`Articles with audio comments: ${audioCount}`);
  
  if (audioCount === 0) {
    console.warn(`WARNING: No audio comments found in ${tableName}. Check database columns.`);
  }
  
  return processedData;
};
