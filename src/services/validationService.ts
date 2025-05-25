
import { supabase } from "@/integrations/supabase/client";

export interface TableValidationResult {
  tableName: string;
  exists: boolean;
  hasArticles: boolean;
  articleCount: number;
  hasAudioComments: number;
  error?: string;
}

export interface SystemHealthReport {
  totalTables: number;
  validTables: number;
  invalidTables: number;
  totalArticles: number;
  totalAudioComments: number;
  lastChecked: string;
  issues: string[];
}

export const validateTable = async (tableName: string): Promise<TableValidationResult> => {
  try {
    // Use a more generic approach to avoid TypeScript issues
    const { data, error } = await supabase.rpc('list_tables', { prefix: '' });
    
    if (error) {
      return {
        tableName,
        exists: false,
        hasArticles: false,
        articleCount: 0,
        hasAudioComments: 0,
        error: error.message
      };
    }

    const tableExists = data?.some((table: any) => table.table_name === tableName);
    
    if (!tableExists) {
      return {
        tableName,
        exists: false,
        hasArticles: false,
        articleCount: 0,
        hasAudioComments: 0
      };
    }

    // Use dynamic query for article count
    const { count: articleCount } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true });

    const { count: audioCount } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true })
      .not('comentario_audio', 'is', null);

    return {
      tableName,
      exists: true,
      hasArticles: (articleCount || 0) > 0,
      articleCount: articleCount || 0,
      hasAudioComments: audioCount || 0
    };
  } catch (error) {
    return {
      tableName,
      exists: false,
      hasArticles: false,
      articleCount: 0,
      hasAudioComments: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const generateSystemHealthReport = async (tableNames: string[]): Promise<SystemHealthReport> => {
  const results = await Promise.all(tableNames.map(validateTable));
  
  const validTables = results.filter(r => r.exists && r.hasArticles);
  const totalArticles = results.reduce((sum, r) => sum + r.articleCount, 0);
  const totalAudioComments = results.reduce((sum, r) => sum + r.hasAudioComments, 0);
  
  const issues: string[] = [];
  results.forEach(result => {
    if (!result.exists) {
      issues.push(`Tabela ${result.tableName} não encontrada`);
    } else if (!result.hasArticles) {
      issues.push(`Tabela ${result.tableName} sem artigos`);
    }
    if (result.error) {
      issues.push(`Erro em ${result.tableName}: ${result.error}`);
    }
  });

  return {
    totalTables: tableNames.length,
    validTables: validTables.length,
    invalidTables: results.length - validTables.length,
    totalArticles,
    totalAudioComments,
    lastChecked: new Date().toISOString(),
    issues
  };
};
