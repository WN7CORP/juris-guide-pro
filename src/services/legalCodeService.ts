
import { supabase } from "@/integrations/supabase/client";

export interface LegalArticle {
  id?: string | number; 
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
  comentario_audio?: string; // Explicitly define comentario_audio as an optional property
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

  // Process data with correct typing
  const processedData: LegalArticle[] = data?.map(article => {
    // Create a properly typed object with all potential properties
    const processed: LegalArticle = {
      id: article.id?.toString(),
      artigo: article.artigo,
      numero: article.numero,
      tecnica: article.tecnica,
      formal: article.formal,
      exemplo: article.exemplo,
      // Safely handle comentario_audio which may not exist in all tables
      comentario_audio: 'comentario_audio' in article ? article.comentario_audio : undefined
    };
    
    // Log articles with audio comments for debugging
    if ('comentario_audio' in article && article.comentario_audio) {
      console.log(`Article ${processed.numero} has audio comment:`, processed.comentario_audio);
    }
    
    return processed;
  }) || [];
  
  console.log(`Total articles in ${tableName}:`, processedData.length);
  console.log(`Articles with audio comments: ${processedData.filter(a => a.comentario_audio).length}`);
  
  return processedData;
};

// Function to fetch only articles with audio comments
export const fetchArticlesWithAudioComments = async (tableName: LegalCodeTable): Promise<LegalArticle[]> => {
  console.log(`Fetching articles with audio comments from ${tableName}`);
  
  try {
    // First check if the table has the comentario_audio column
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('list_tables', { prefix: tableName });
    
    if (tableError) {
      console.error(`Error checking table ${tableName}:`, tableError);
      return [];
    }
    
    // Get all articles from the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return [];
    }

    // Filter articles with audio comments in JavaScript instead of SQL
    // This ensures we don't try to filter by a column that doesn't exist
    const articlesWithAudio: LegalArticle[] = data
      .filter(article => 'comentario_audio' in article && article.comentario_audio && article.comentario_audio.trim() !== '')
      .map(article => ({
        id: article.id?.toString(),
        artigo: article.artigo,
        numero: article.numero,
        tecnica: article.tecnica,
        formal: article.formal,
        exemplo: article.exemplo,
        comentario_audio: 'comentario_audio' in article ? article.comentario_audio : undefined
      }));

    console.log(`Found ${articlesWithAudio.length} articles with audio comments in ${tableName}`);
    
    return articlesWithAudio;
  } catch (error) {
    console.error(`Error processing audio comments from ${tableName}:`, error);
    return [];
  }
};
