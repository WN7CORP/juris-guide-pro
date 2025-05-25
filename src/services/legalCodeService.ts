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

// Cache para armazenar artigos carregados
const articleCache: Record<string, LegalArticle[]> = {};

export const fetchLegalCode = async (
  tableName: string, 
  page = 1, 
  pageSize = 20
): Promise<{ articles: LegalArticle[], total: number }> => {
  try {
    // Verificar se já temos no cache
    if (articleCache[tableName]) {
      // Se temos todos os artigos no cache, podemos paginar localmente
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
      .from(tableName as any)
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error(`Error counting articles in ${tableName}:`, countError);
      throw new Error(`Failed to count articles in ${tableName}`);
    }
    
    const total = count || 0;
    
    // Calcular o início e fim para paginação
    const start = (page - 1) * pageSize;
    
    // Buscar artigos com paginação
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .range(start, start + pageSize - 1)
      .order('id', { ascending: true });
      
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
    }

    // Processar dados
    const processedData = data?.map(article => {
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
    
    console.log(`Loaded ${processedData.length} articles from ${tableName} (page ${page})`);
    
    return { articles: processedData, total };
  } catch (err) {
    console.error(`Failed to fetch ${tableName}:`, err);
    return { articles: [], total: 0 };
  }
};

// Função para carregar todos os artigos de um código (para casos específicos)
export const fetchAllLegalCode = async (tableName: string): Promise<LegalArticle[]> => {
  try {
    // Se já temos no cache, retorna do cache
    if (articleCache[tableName]) {
      return articleCache[tableName];
    }
    
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      console.error(`Error fetching all articles from ${tableName}:`, error);
      throw new Error(`Failed to fetch all articles from ${tableName}: ${error.message}`);
    }

    // Processar dados
    const processedData = data?.map(article => {
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
    
    // Armazenar no cache
    articleCache[tableName] = processedData;
    
    console.log(`Loaded all ${processedData.length} articles from ${tableName}`);
    return processedData;
  } catch (err) {
    console.error(`Failed to fetch all articles from ${tableName}:`, err);
    return [];
  }
};

// Helper function to determine if an article number is an exact match
const isExactArticleMatch = (articleNumber: string | undefined, searchTerm: string): boolean => {
  if (!articleNumber) return false;
  
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedArticle = articleNumber.toLowerCase();
  
  // Extract just the number from article number (e.g., "Art. 9" -> "9")
  const articleNumMatch = articleNumber.match(/(\d+)/);
  if (!articleNumMatch) return false;
  
  const articleNum = articleNumMatch[1];
  
  // Check for exact number match
  if (articleNum === normalizedSearch) return true;
  
  // Check for exact ordinal match (9º, 9°, 9o)
  if (normalizedSearch === articleNum + 'º' || 
      normalizedSearch === articleNum + '°' || 
      normalizedSearch === articleNum + 'o') return true;
      
  // Check for exact "art X" patterns
  const searchNumMatch = normalizedSearch.match(/(?:art(?:igo)?\.?\s+)?(\d+)/);
  if (searchNumMatch && searchNumMatch[1] === articleNum) return true;
  
  return false;
};

// Helper function to determine if an article number starts with the search term
const startsWithSearchTerm = (articleNumber: string | undefined, searchTerm: string): boolean => {
  if (!articleNumber) return false;
  
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedArticle = articleNumber.toLowerCase();
  
  // Extract just the number from article number
  const articleNumMatch = articleNumber.match(/(\d+)/);
  if (!articleNumMatch) return false;
  
  const articleNum = articleNumMatch[1];
  
  // Check if article number starts with search term
  return articleNum.startsWith(normalizedSearch);
};

// Enhanced function to search across all legal codes with improved article number matching
export const searchAllLegalCodes = async (
  searchTerm: string,
  tableNames: string[],
  options: { 
    searchContent?: boolean,
    searchExplanations?: boolean,
    searchExamples?: boolean,
    onlyWithAudio?: boolean,
    limit?: number,
    page?: number,
    pageSize?: number
  } = {}
): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  console.log("=== SEARCH DEBUG ===");
  console.log("Search term:", searchTerm);
  console.log("Options:", options);
  
  if (!searchTerm || searchTerm.trim().length < 1) {
    console.log("Search term too short, returning empty results");
    return [];
  }
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  console.log("Normalized search term:", normalizedSearchTerm);
  
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  const searchLimit = options.limit || 100;
  
  // Enhanced article number detection
  const isArticleNumber = /^(\d+)[ºo°]?$/i.test(normalizedSearchTerm) || 
                         /^art(?:igo)?\.?\s*(\d+)[ºo°]?$/i.test(normalizedSearchTerm);
  console.log("Is article number search:", isArticleNumber);
  
  // Process tables in parallel for better performance
  const searchPromises = tableNames.map(async (tableName) => {
    console.log(`Searching in table: ${tableName}`);
    
    try {
      // Check cache first for this table
      if (articleCache[tableName]) {
        console.log(`Using cached data for ${tableName}, ${articleCache[tableName].length} articles`);
        
        // Search in cached data with improved matching
        let matchingArticles = articleCache[tableName].filter(article => {
          // Filter by audio if requested
          if (options.onlyWithAudio && !article.comentario_audio) {
            return false;
          }
          
          // Enhanced search in numero - improved for different formats
          if (article.numero) {
            const numeroText = article.numero.toLowerCase();
            
            // Direct match
            if (numeroText.includes(normalizedSearchTerm)) {
              console.log(`Direct match found: ${article.numero}`);
              return true;
            }
            
            // Extract just the number from the article number
            const numeroMatch = article.numero.match(/(\d+)/);
            if (numeroMatch) {
              const articleNum = numeroMatch[1];
              
              // Match against search term variations
              const searchNum = normalizedSearchTerm.match(/(\d+)/);
              if (searchNum && articleNum === searchNum[1]) {
                console.log(`Number match found: ${article.numero} matches ${normalizedSearchTerm}`);
                return true;
              }
              
              // Match ordinal variations (1º, 1°, 1o)
              if (normalizedSearchTerm === articleNum + 'º' || 
                  normalizedSearchTerm === articleNum + '°' || 
                  normalizedSearchTerm === articleNum + 'o' ||
                  normalizedSearchTerm === articleNum) {
                console.log(`Ordinal match found: ${article.numero} matches ${normalizedSearchTerm}`);
                return true;
              }
            }
          }
          
          // Search in article content if enabled (default for non-number searches)
          if (!isArticleNumber && options.searchContent !== false && 
              article.artigo?.toLowerCase().includes(normalizedSearchTerm)) {
            console.log(`Content match found in article: ${article.numero}`);
            return true;
          }

          // Search in explanations if requested
          if (!isArticleNumber && options.searchExplanations && (
            (article.tecnica && article.tecnica.toLowerCase().includes(normalizedSearchTerm)) ||
            (article.formal && article.formal.toLowerCase().includes(normalizedSearchTerm))
          )) {
            console.log(`Explanation match found in article: ${article.numero}`);
            return true;
          }
          
          // Search in examples if requested
          if (!isArticleNumber && options.searchExamples && 
            article.exemplo && article.exemplo.toLowerCase().includes(normalizedSearchTerm)) {
            console.log(`Example match found in article: ${article.numero}`);
            return true;
          }
          
          return false;
        });

        // Smart sorting: prioritize exact matches for article numbers
        if (isArticleNumber) {
          matchingArticles.sort((a, b) => {
            const aExact = isExactArticleMatch(a.numero, normalizedSearchTerm);
            const bExact = isExactArticleMatch(b.numero, normalizedSearchTerm);
            
            // Exact matches first
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // If both are exact or both are not exact, check starts with
            const aStarts = startsWithSearchTerm(a.numero, normalizedSearchTerm);
            const bStarts = startsWithSearchTerm(b.numero, normalizedSearchTerm);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Finally, sort by article number numerically
            const aNum = a.numero?.match(/(\d+)/)?.[1];
            const bNum = b.numero?.match(/(\d+)/)?.[1];
            
            if (aNum && bNum) {
              return parseInt(aNum) - parseInt(bNum);
            }
            
            return 0;
          });
        }

        matchingArticles = matchingArticles.slice(0, searchLimit);
        
        console.log(`Found ${matchingArticles.length} matches in cached ${tableName}`);
        
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
      console.log(`Cache miss for ${tableName}, querying database`);
      let filters = [];
      
      // Enhanced numero search with multiple patterns
      if (isArticleNumber) {
        // For article numbers, use multiple search patterns
        const numberMatch = normalizedSearchTerm.match(/(\d+)/);
        if (numberMatch) {
          const num = numberMatch[1];
          filters.push(`numero.ilike.%${num}%`);
          filters.push(`numero.ilike.%${num}º%`);
          filters.push(`numero.ilike.%${num}°%`);
          filters.push(`numero.ilike.%art.${num}%`);
          filters.push(`numero.ilike.%artigo ${num}%`);
        }
      } else {
        // For text searches, include numero search
        filters.push(`numero.ilike.%${normalizedSearchTerm}%`);
        
        // Include content search if enabled (default true for non-numbers)
        if (options.searchContent !== false) {
          filters.push(`artigo.ilike.%${normalizedSearchTerm}%`);
        }
        
        // Add explanation filters if requested
        if (options.searchExplanations) {
          filters.push(`tecnica.ilike.%${normalizedSearchTerm}%`);
          filters.push(`formal.ilike.%${normalizedSearchTerm}%`);
        }
        
        // Add example filter if requested
        if (options.searchExamples) {
          filters.push(`exemplo.ilike.%${normalizedSearchTerm}%`);
        }
      }
      
      // Build the OR filter string
      const filterString = filters.join(',');
      console.log(`Using filters for ${tableName}:`, filterString);
      
      // Start building query
      let query = supabase
        .from(tableName as any)
        .select('*')
        .or(filterString)
        .limit(searchLimit);
      
      // Add audio filter if requested
      if (options.onlyWithAudio) {
        query = query.not('comentario_audio', 'is', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error searching in ${tableName}:`, error);
        return null;
      }
      
      console.log(`Database query returned ${data?.length || 0} results for ${tableName}`);
      
      if (data && data.length > 0) {
        let articles = data.map(article => {
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

        // Apply smart sorting for database results too
        if (isArticleNumber) {
          articles.sort((a, b) => {
            const aExact = isExactArticleMatch(a.numero, normalizedSearchTerm);
            const bExact = isExactArticleMatch(b.numero, normalizedSearchTerm);
            
            // Exact matches first
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // If both are exact or both are not exact, check starts with
            const aStarts = startsWithSearchTerm(a.numero, normalizedSearchTerm);
            const bStarts = startsWithSearchTerm(b.numero, normalizedSearchTerm);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Finally, sort by article number numerically
            const aNum = a.numero?.match(/(\d+)/)?.[1];
            const bNum = b.numero?.match(/(\d+)/)?.[1];
            
            if (aNum && bNum) {
              return parseInt(aNum) - parseInt(bNum);
            }
            
            return 0;
          });
        }
        
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
      console.log(`Adding ${result.articles.length} results from ${result.codeId}`);
      results.push(result);
    }
  });
  
  console.log(`Total search results: ${results.reduce((sum, r) => sum + r.articles.length, 0)}`);
  console.log("=== END SEARCH DEBUG ===");
  
  return results;
};

// Enhanced function to get articles with audio comments
export const getArticlesWithAudioComments = async (tableNames: string[]): Promise<{codeId: string, articles: LegalArticle[]}[]> => {
  const results: {codeId: string, articles: LegalArticle[]}[] = [];
  
  // Process tables in parallel for better performance
  const audioPromises = tableNames.map(async (tableName) => {
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
        .from(tableName as any)
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
