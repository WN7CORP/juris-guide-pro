
import { supabase } from "@/integrations/supabase/client";
import { KNOWN_TABLES, validateTableName } from "@/utils/tableMapping";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TableHealthCheck {
  tableName: string;
  exists: boolean;
  recordCount: number;
  hasValidStructure: boolean;
  errors: string[];
}

/**
 * Serviço para validação de integridade de dados e tabelas
 */
export class ValidationService {
  
  /**
   * Valida se uma tabela existe e tem estrutura correta
   */
  static async validateTable(tableName: string): Promise<TableHealthCheck> {
    const result: TableHealthCheck = {
      tableName,
      exists: false,
      recordCount: 0,
      hasValidStructure: false,
      errors: []
    };

    try {
      // Check if table name is valid
      if (!validateTableName(tableName)) {
        result.errors.push(`Table name '${tableName}' is not in the known tables list`);
        return result;
      }

      // Try to count records to verify table exists
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        result.errors.push(`Table '${tableName}' does not exist or is not accessible: ${error.message}`);
        return result;
      }

      result.exists = true;
      result.recordCount = count || 0;

      // Check basic structure for legal code tables
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('id, artigo, numero')
        .limit(1);

      if (sampleError) {
        result.errors.push(`Table '${tableName}' missing required columns: ${sampleError.message}`);
      } else {
        result.hasValidStructure = true;
      }

    } catch (error) {
      result.errors.push(`Unexpected error validating table '${tableName}': ${error}`);
    }

    return result;
  }

  /**
   * Valida integridade do sistema de comentários
   */
  static async validateCommentSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if user_profiles table exists and has required structure
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .limit(1);

      if (profileError) {
        result.isValid = false;
        result.errors.push(`user_profiles table issue: ${profileError.message}`);
      }

      // Check if article_comments table exists
      const { data: comments, error: commentError } = await supabase
        .from('article_comments')
        .select('id, user_id, article_id')
        .limit(1);

      if (commentError) {
        result.isValid = false;
        result.errors.push(`article_comments table issue: ${commentError.message}`);
      }

      // Check if comment_likes table exists
      const { data: likes, error: likeError } = await supabase
        .from('comment_likes')
        .select('id, user_id, comment_id')
        .limit(1);

      if (likeError) {
        result.isValid = false;
        result.errors.push(`comment_likes table issue: ${likeError.message}`);
      }

      // Check for orphaned comments (comments without valid user profiles)
      if (!profileError && !commentError) {
        const { data: orphanedComments, error: orphanError } = await supabase
          .from('article_comments')
          .select(`
            id,
            user_id,
            user_profiles!inner(id)
          `)
          .is('user_profiles.id', null)
          .limit(5);

        if (orphanError) {
          result.warnings.push(`Could not check for orphaned comments: ${orphanError.message}`);
        } else if (orphanedComments && orphanedComments.length > 0) {
          result.warnings.push(`Found ${orphanedComments.length} comments with invalid user references`);
        }
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Unexpected error validating comment system: ${error}`);
    }

    return result;
  }

  /**
   * Valida todas as tabelas conhecidas
   */
  static async validateAllTables(): Promise<TableHealthCheck[]> {
    const results: TableHealthCheck[] = [];
    
    for (const tableName of KNOWN_TABLES) {
      const result = await this.validateTable(tableName);
      results.push(result);
    }

    return results;
  }

  /**
   * Gera relatório de saúde do sistema
   */
  static async generateHealthReport(): Promise<{
    tables: TableHealthCheck[];
    commentSystem: ValidationResult;
    summary: {
      totalTables: number;
      validTables: number;
      invalidTables: number;
      totalErrors: number;
      totalWarnings: number;
    };
  }> {
    const [tables, commentSystem] = await Promise.all([
      this.validateAllTables(),
      this.validateCommentSystem()
    ]);

    const validTables = tables.filter(t => t.exists && t.hasValidStructure).length;
    const invalidTables = tables.filter(t => !t.exists || !t.hasValidStructure).length;
    const totalErrors = tables.reduce((acc, t) => acc + t.errors.length, 0) + commentSystem.errors.length;
    const totalWarnings = commentSystem.warnings.length;

    return {
      tables,
      commentSystem,
      summary: {
        totalTables: tables.length,
        validTables,
        invalidTables,
        totalErrors,
        totalWarnings
      }
    };
  }
}
