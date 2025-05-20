
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
export type LegalCodeTable = 'Código_Civil' | 'Código_Penal' | 'Código_de_Processo_Civil' | 
  'Código_de_Processo_Penal' | 'Código_Tributário_Nacional' | 'Código_de_Defesa_do_Consumidor' | 
  'Código_de_Trânsito_Brasileiro' | 'Código_Eleitoral' | 'Constituicao_Federal';

// Add pagination parameters
export const fetchLegalCode = async (
  tableName: LegalCodeTable, 
  page: number = 1, 
  pageSize: number = 50
): Promise<{ articles: LegalArticle[], totalCount: number }> => {
  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // First get the count
  const countResponse = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
    
  const totalCount = countResponse.count || 0;
  
  // Then get the paginated data
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  // Convert number ids to strings if needed and process data safely
  const processedData = data?.map(article => {
    // Use type assertion to tell TypeScript this is a safe operation
    const rawArticle = article as any;
    
    // Handle data coming from Supabase safely with proper type assertions
    const processedArticle: LegalArticle = {
      id: rawArticle.id?.toString() || '',
      artigo: rawArticle.artigo || '',
      numero: rawArticle.numero,
      tecnica: rawArticle.tecnica,
      formal: rawArticle.formal,
      exemplo: rawArticle.exemplo,
      comentario_audio: rawArticle.comentario_audio
    };
    
    // Log articles with audio comments for debugging (only in development)
    if (processedArticle.comentario_audio) {
      console.log(`Article with audio found:`, processedArticle);
    }
    
    return processedArticle;
  }) || [];
  
  console.log(`Fetched ${processedData.length} articles out of ${totalCount} from ${tableName}`);
  return { articles: processedData, totalCount };
};

// Add a function to fetch a specific article by ID
export const fetchArticleById = async (
  tableName: LegalCodeTable,
  articleId: string | number
): Promise<LegalArticle | null> => {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', articleId.toString()) // Convert to string to handle both string and number IDs
    .single();

  if (error) {
    console.error(`Error fetching article ${articleId} from ${tableName}:`, error);
    return null;
  }

  if (!data) return null;
  
  // Process the article data
  const rawArticle = data as any;
  const article: LegalArticle = {
    id: rawArticle.id?.toString() || '',
    artigo: rawArticle.artigo || '',
    numero: rawArticle.numero,
    tecnica: rawArticle.tecnica,
    formal: rawArticle.formal,
    exemplo: rawArticle.exemplo,
    comentario_audio: rawArticle.comentario_audio
  };
  
  return article;
};
