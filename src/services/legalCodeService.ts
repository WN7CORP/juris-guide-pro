
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

  // Enhanced logging for debugging
  console.log(`Raw data from ${tableName}:`, data?.slice(0, 3));
  
  // Process and check audio fields differently depending on the table
  let processedData: LegalArticle[] = [];
  
  if (tableName === 'Código_Penal') {
    console.log(`Special processing for Código_Penal table`);
    
    // For Código_Penal, do a detailed inspection of audio fields
    processedData = data?.map(article => {
      const typedArticle = article as DatabaseArticle;
      
      // Check explicitly for both audio fields
      const hasCommentarioAudio = !!typedArticle.comentario_audio;
      const hasArtigoAudio = !!typedArticle.artigo_audio;
      
      console.log(`Article ${typedArticle.numero || typedArticle.id}: ` + 
        `comentario_audio: ${hasCommentarioAudio}, ` +
        `artigo_audio: ${hasArtigoAudio}`);
      
      if (hasCommentarioAudio) {
        console.log(`  comentario_audio URL: ${typedArticle.comentario_audio}`);
      }
      
      if (hasArtigoAudio) {
        console.log(`  artigo_audio URL: ${typedArticle.artigo_audio}`);
      }
      
      // Create a processed article with the audio fields
      // IMPORTANT: Map both audio fields to comentario_audio to ensure unified handling
      const processed: LegalArticle = {
        ...typedArticle,
        id: typedArticle.id?.toString(),
        artigo: typedArticle.artigo,
        numero: typedArticle.numero,
        tecnica: typedArticle.tecnica,
        formal: typedArticle.formal,
        exemplo: typedArticle.exemplo,
        comentario_audio: typedArticle.comentario_audio || typedArticle.artigo_audio,
        artigo_audio: typedArticle.artigo_audio
      };
      
      return processed;
    }) || [];
    
    // Count articles with audio fields
    const withCommentarioAudio = processedData.filter(a => a.comentario_audio).length;
    const withArtigoAudio = processedData.filter(a => a.artigo_audio).length;
    
    console.log(`Código_Penal stats: ` + 
      `Total articles: ${processedData.length}, ` +
      `With comentario_audio: ${withCommentarioAudio}, ` +
      `With artigo_audio: ${withArtigoAudio}`);
  } 
  else {
    // Regular processing for other tables
    processedData = data?.map(article => {
      const typedArticle = article as DatabaseArticle;
      
      return {
        ...typedArticle,
        id: typedArticle.id?.toString(),
        artigo: typedArticle.artigo,
        numero: typedArticle.numero,
        tecnica: typedArticle.tecnica,
        formal: typedArticle.formal,
        exemplo: typedArticle.exemplo,
        comentario_audio: typedArticle.comentario_audio || typedArticle.artigo_audio
      };
    }) || [];
  }
  
  console.log(`Total articles processed from ${tableName}:`, processedData.length);
  const audioCount = processedData.filter(a => a.comentario_audio).length;
  console.log(`Articles with audio comments: ${audioCount}`);
  
  if (audioCount === 0) {
    console.warn(`WARNING: No audio comments found in ${tableName}. Check database columns.`);
  }
  
  return processedData;
};
