
import { supabase } from "@/integrations/supabase/client";

export interface LegalArticle {
  id?: string | number; // Changed to accept both string and number
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
type LegalCodeTable = 'Código_Civil' | 'Código_Penal' | 'Código_de_Processo_Civil' | 
  'Código_de_Processo_Penal' | 'Código_Tributário_Nacional' | 'Código_de_Defesa_do_Consumidor' | 
  'Código_de_Trânsito_Brasileiro' | 'Código_Eleitoral' | 'Constituicao_Federal';

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
    // Use type assertion to inform TypeScript about the shape of the data
    const processedArticle: LegalArticle = {
      ...article,
      id: article.id?.toString(), // Convert id to string if needed
      comentario_audio: article.comentario_audio || undefined
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
