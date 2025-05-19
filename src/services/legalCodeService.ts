import { supabase } from "@/integrations/supabase/client";

// Update the interface to include comentario_audio as an optional field
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
type LegalCodeTable = 'Código_Civil' | 'Código_Penal' | 'Código_de_Processo_Civil' | 
  'Código_de_Processo_Penal' | 'Código_Tributário_Nacional' | 'Código_de_Defesa_do_Consumidor' | 
  'Código_de_Trânsito_Brasileiro' | 'Código_Eleitoral' | 'Constituicao_Federal' |
  'Estatuto_da_Criança_e_do_Adolescente' | 'Estatuto_do_Idoso' | 'Estatuto_da_Pessoa_com_Deficiência' |
  'Estatuto_da_Igualdade_Racial' | 'Estatuto_da_Cidade' | 'Estatuto_da_Terra' | 
  'Estatuto_do_Desarmamento' | 'Estatuto_do_Torcedor' | 'Estatuto_da_Advocacia_e_da_OAB' |
  'Estatuto_dos_Servidores_Públicos_Civis_da_União';

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
  
  // Check specifically if any articles have comentario_audio
  const articlesWithAudio = data?.filter(article => article.comentario_audio);
  console.log(`Articles with audio in ${tableName}:`, articlesWithAudio?.length || 0);
  
  if (articlesWithAudio?.length) {
    console.log(`First article with audio:`, articlesWithAudio[0]);
  }

  // Convert number ids to strings if needed and log for debugging
  const processedData = data?.map(article => {
    // Ensure explicit type casting with defined properties
    const processed: LegalArticle = {
      id: article.id?.toString(), // Convert id to string if needed
      artigo: article.artigo,
      numero: article.numero,
      tecnica: article.tecnica,
      formal: article.formal,
      exemplo: article.exemplo,
      comentario_audio: article.comentario_audio
    };
    
    // Log articles with audio comments for debugging
    if (article.comentario_audio) {
      console.log(`Article ${processed.numero || processed.id} has audio comment:`, processed.comentario_audio);
    }
    
    return processed;
  }) || [];
  
  console.log(`Total articles in ${tableName}:`, processedData.length);
  console.log(`Articles with audio comments: ${processedData.filter(a => a.comentario_audio).length}`);
  
  return processedData;
};

// Function to get all available legal codes
export const getAllLegalCodes = async (): Promise<{id: string, title: string, count: number}[]> => {
  const legalCodeTables: LegalCodeTable[] = [
    'Constituicao_Federal',
    'Código_Civil',
    'Código_Penal',
    'Código_de_Processo_Civil',
    'Código_de_Processo_Penal',
    'Código_Tributário_Nacional',
    'Código_de_Defesa_do_Consumidor',
    'Código_de_Trânsito_Brasileiro',
    'Código_Eleitoral',
    'Estatuto_da_Criança_e_do_Adolescente',
    'Estatuto_do_Idoso',
    'Estatuto_da_Pessoa_com_Deficiência',
    'Estatuto_da_Igualdade_Racial',
    'Estatuto_da_Cidade',
    'Estatuto_da_Terra',
    'Estatuto_do_Desarmamento',
    'Estatuto_do_Torcedor',
    'Estatuto_da_Advocacia_e_da_OAB',
    'Estatuto_dos_Servidores_Públicos_Civis_da_União'
  ];

  const results = await Promise.all(legalCodeTables.map(async (table) => {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`Error counting items in ${table}:`, error);
      return { id: table, title: formatTableName(table), count: 0 };
    }

    return { id: table, title: formatTableName(table), count: count || 0 };
  }));

  return results;
};

// Helper function to format table names for display
const formatTableName = (tableName: string): string => {
  return tableName
    .replace(/_/g, ' ')
    .replace(/Código/g, 'Código');
};

// Get popular legal codes
export const getPopularLegalCodes = (): {id: string, title: string, description: string}[] => {
  return [
    {
      id: 'Constituicao_Federal',
      title: 'Constituição Federal',
      description: 'Lei fundamental e suprema do Brasil, servindo de parâmetro para todas as demais normas jurídicas.'
    },
    {
      id: 'Código_Civil',
      title: 'Código Civil',
      description: 'Regula os direitos e obrigações de ordem privada das pessoas, dos bens e de suas relações.'
    },
    {
      id: 'Código_Penal',
      title: 'Código Penal',
      description: 'Define os crimes e estabelece as penas correspondentes às condutas consideradas criminosas.'
    },
    {
      id: 'Código_de_Processo_Civil',
      title: 'Código de Processo Civil',
      description: 'Regula o processo civil e estabelece normas para o exercício da jurisdição civil.'
    }
  ];
};

// Get legal codes by category
export const getLegalCodesByCategory = (): {category: string, codes: {id: string, title: string}[]}[] => {
  return [
    {
      category: "Direito Civil",
      codes: [
        { id: "Código_Civil", title: "Código Civil" },
        { id: "Código_de_Defesa_do_Consumidor", title: "Código de Defesa do Consumidor" }
      ]
    },
    {
      category: "Direito Penal",
      codes: [
        { id: "Código_Penal", title: "Código Penal" },
        { id: "Código_de_Processo_Penal", title: "Código de Processo Penal" }
      ]
    },
    {
      category: "Direito Processual",
      codes: [
        { id: "Código_de_Processo_Civil", title: "Código de Processo Civil" },
        { id: "Código_de_Processo_Penal", title: "Código de Processo Penal" }
      ]
    },
    {
      category: "Estatutos",
      codes: [
        { id: "Estatuto_da_Criança_e_do_Adolescente", title: "Estatuto da Criança e do Adolescente" },
        { id: "Estatuto_do_Idoso", title: "Estatuto do Idoso" },
        { id: "Estatuto_da_Pessoa_com_Deficiência", title: "Estatuto da Pessoa com Deficiência" }
      ]
    }
  ];
};
