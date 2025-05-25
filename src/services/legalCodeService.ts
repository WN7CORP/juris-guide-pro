
import { supabase } from "@/integrations/supabase/client";
import { validateTableName } from "@/utils/tableMapping";

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
  return tableName as any;
}

// Cache para armazenar artigos carregados
const articleCache: Record<string, LegalArticle[]> = {};

// Enhanced error handling for table operations
const handleTableError = (tableName: string, error: any, operation: string) => {
  console.error(`Error in ${operation} for table ${tableName}:`, error);
  
  // Check if it's a table not found error
  if (error.code === 'PGRST106' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
    throw new Error(`Tabela '${tableName}' não encontrada no banco de dados`);
  }
  
  // Check if it's a permission error
  if (error.code === 'PGRST301' || error.message?.includes('permission')) {
    throw new Error(`Sem permissão para acessar a tabela '${tableName}'`);
  }
  
  throw new Error(`Falha ao ${operation} na tabela ${tableName}: ${error.message}`);
};

export const fetchLegalCode = async (
  tableName: string, 
  page = 1, 
  pageSize = 20
): Promise<{ articles: LegalArticle[], total: number }> => {
  try {
    // Validate table name before proceeding
    if (!validateTableName(tableName)) {
      throw new Error(`Nome de tabela inválido: ${tableName}`);
    }

    // Verificar se já temos no cache
    const cacheKey = `${tableName}-${page}-${pageSize}`;
    if (articleCache[tableName]) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedArticles = articleCache[tableName].slice(start, end);
      return { 
        articles: paginatedArticles, 
        total: articleCache[tableName].length 
      };
    }
    
    // Obter contagem total de artigos para paginação
    const { count, error: countError } = await supabase
      .from(safeTableCast(tableName))
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      handleTableError(tableName, countError, 'contar artigos');
    }
    
    const total = count || 0;
    
    // Calcular o início e fim para paginação
    const start = (page - 1) * pageSize;
    
    // Buscar artigos com paginação
    const { data, error } = await supabase
      .from(safeTableCast(tableName))
      .select('*')
      .range(start, start + pageSize - 1)
      .order('id', { ascending: true });
      
    if (error) {
      handleTableError(tableName, error, 'buscar artigos');
    }

    // Processar dados com validação
    const processedData = data?.map(article => {
      const articleData = article as Record<string, any>;
      
      // Validate required fields
      if (!articleData.artigo) {
        console.warn(`Article with id ${articleData.id} missing required 'artigo' field`);
      }
      
      const processedArticle: LegalArticle = {
        id: articleData.id?.toString() || '',
        artigo: articleData.artigo || 'Conteúdo não disponível',
        numero: articleData.numero,
        tecnica: articleData.tecnica,
        formal: articleData.formal,
        exemplo: articleData.exemplo,
        comentario_audio: articleData.comentario_audio
      };
      
      return processedArticle;
    }) || [];
    
    console.log(`Loaded ${processedData.length} articles from ${tableName} (page ${page})`);
    
    return { articles: processedData, total };
  } catch (err) {
    console.error(`Failed to fetch ${tableName}:`, err);
    
    // Return more informative error for the UI
    if (err instanceof Error) {
      throw err;
    }
    
    throw new Error(`Erro inesperado ao carregar ${tableName}`);
  }
};

// Função para carregar todos os artigos de um código (para casos específicos)
export const fetchAllLegalCode = async (tableName: string): Promise<LegalArticle[]> => {
  try {
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new Error(`Nome de tabela inválido: ${tableName}`);
    }

    // Se já temos no cache, retorna do cache
    if (articleCache[tableName]) {
      return articleCache[tableName];
    }
    
    const { data, error } = await supabase
      .from(safeTableCast(tableName))
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      handleTableError(tableName, error, 'buscar todos os artigos');
    }

    // Processar dados com validação
    const processedData = data?.map(article => {
      const articleData = article as Record<string, any>;
      
      const processedArticle: LegalArticle = {
        id: articleData.id?.toString() || '',
        artigo: articleData.artigo || 'Conteúdo não disponível',
        numero: articleData.numero,
        tecnica: articleData.tecnica,
        formal: articleData.formal,
        exemplo: articleData.exemplo,
        comentario_audio: articleData.comentario_audio
      };
      
      return processedArticle;
    }) || [];
    
    // Armazenar no cache
    articleCache[tableName] = processedData;
    
    console.log(`Loaded all ${processedData.length} articles from ${tableName}`);
    return processedData;
  } catch (err) {
    console.error(`Failed to fetch all articles from ${tableName}:`, err);
    
    if (err instanceof Error) {
      throw err;
    }
    
    throw new Error(`Erro inesperado ao carregar todos os artigos de ${tableName}`);
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
    limit?: number,
    page?: number,
    pageSize?: number
  } = {}
): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  const searchLimit = options.limit || 100;
  
  // Filter out invalid table names
  const validTableNames = tableNames.filter(tableName => {
    const isValid = validateTableName(tableName);
    if (!isValid) {
      console.warn(`Skipping invalid table name: ${tableName}`);
    }
    return isValid;
  });

  // Process tables in parallel for better performance
  const searchPromises = validTableNames.map(async (tableName) => {
    try {
      // Check cache first for this table
      if (articleCache[tableName]) {
        // Search in cached data
        const matchingArticles = articleCache[tableName].filter(article => {
          // Search in article content
          if (article.artigo?.toLowerCase().includes(normalizedSearchTerm)) {
            return true;
          }
          
          // Search in numero if available
          if (article.numero?.toLowerCase().includes(normalizedSearchTerm)) {
            return true;
          }

          // Search in explanations if requested
          if (options.searchExplanations && (
            (article.tecnica && article.tecnica.toLowerCase().includes(normalizedSearchTerm)) ||
            (article.formal && article.formal.toLowerCase().includes(normalizedSearchTerm))
          )) {
            return true;
          }
          
          // Search in examples if requested
          if (options.searchExamples && 
            article.exemplo && article.exemplo.toLowerCase().includes(normalizedSearchTerm)) {
            return true;
          }
          
          return false;
        }).slice(0, searchLimit);
        
        if (matchingArticles.length > 0) {
          return {
            codeId: tableName,
            articles: matchingArticles
          };
        } else {
          return null;
        }
      }
      
      // If not in cache, build query filters for Supabase
      let filters = [];
      
      // Always include content search
      filters.push(`artigo.ilike.%${normalizedSearchTerm}%`);
      
      // Include numero search
      filters.push(`numero.ilike.%${normalizedSearchTerm}%`);
      
      // Add explanation filters if requested
      if (options.searchExplanations) {
        filters.push(`tecnica.ilike.%${normalizedSearchTerm}%`);
        filters.push(`formal.ilike.%${normalizedSearchTerm}%`);
      }
      
      // Add example filter if requested
      if (options.searchExamples) {
        filters.push(`exemplo.ilike.%${normalizedSearchTerm}%`);
      }
      
      // Build the OR filter string
      const filterString = filters.join(',');
      
      // Query Supabase with our filters
      const { data, error } = await supabase
        .from(safeTableCast(tableName))
        .select('*')
        .or(filterString)
        .limit(searchLimit);
      
      if (error) {
        console.error(`Error searching in ${tableName}:`, error);
        return null;
      }
      
      if (data && data.length > 0) {
        const articles = data.map(article => {
          const articleData = article as Record<string, any>;
          
          const processedArticle: LegalArticle = {
            id: articleData.id?.toString() || '',
            artigo: articleData.artigo || 'Conteúdo não disponível',
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
  
  // Filter valid table names
  const validTableNames = tableNames.filter(tableName => validateTableName(tableName));
  
  // Process tables in parallel for better performance
  const audioPromises = validTableNames.map(async (tableName) => {
    try {
      // Check cache first
      if (articleCache[tableName]) {
        const articlesWithAudio = articleCache[tableName].filter(a => a.comentario_audio);
        if (articlesWithAudio.length > 0) {
          return {
            codeId: tableName,
            articles: articlesWithAudio
          };
        }
      }
      
      // If not in cache, query Supabase
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
            artigo: articleData.artigo || 'Conteúdo não disponível',
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

// Clear the cache for a specific table or all tables
export const clearArticleCache = (tableName?: string): void => {
  if (tableName) {
    delete articleCache[tableName];
  } else {
    Object.keys(articleCache).forEach(key => {
      delete articleCache[key];
    });
  }
};

// New function to get cache status for debugging
export const getCacheStatus = (): { tableName: string, articleCount: number }[] => {
  return Object.entries(articleCache).map(([tableName, articles]) => ({
    tableName,
    articleCount: articles.length
  }));
};
