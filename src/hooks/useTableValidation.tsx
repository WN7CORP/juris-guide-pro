
import { useState, useEffect } from 'react';
import { ValidationService } from '@/services/validationService';
import { toast } from 'sonner';

interface TableValidationState {
  isValidating: boolean;
  healthReport: any | null;
  lastValidation: Date | null;
  hasErrors: boolean;
}

export const useTableValidation = () => {
  const [state, setState] = useState<TableValidationState>({
    isValidating: false,
    healthReport: null,
    lastValidation: null,
    hasErrors: false
  });

  const runValidation = async (showToasts = true) => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const healthReport = await ValidationService.generateHealthReport();
      
      setState({
        isValidating: false,
        healthReport,
        lastValidation: new Date(),
        hasErrors: healthReport.summary.totalErrors > 0
      });

      if (showToasts) {
        if (healthReport.summary.totalErrors > 0) {
          toast.error(`Encontrados ${healthReport.summary.totalErrors} erros no sistema`);
        } else if (healthReport.summary.totalWarnings > 0) {
          toast.warning(`Sistema OK, mas há ${healthReport.summary.totalWarnings} avisos`);
        } else {
          toast.success('Sistema validado com sucesso!');
        }
      }

      return healthReport;
    } catch (error) {
      console.error('Error during validation:', error);
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        hasErrors: true 
      }));
      
      if (showToasts) {
        toast.error('Erro ao validar sistema');
      }
      return null;
    }
  };

  const validateSingleTable = async (tableName: string) => {
    try {
      const result = await ValidationService.validateTable(tableName);
      
      if (result.errors.length > 0) {
        toast.error(`Tabela ${tableName}: ${result.errors.join(', ')}`);
      } else {
        toast.success(`Tabela ${tableName} validada com sucesso`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error validating table ${tableName}:`, error);
      toast.error(`Erro ao validar tabela ${tableName}`);
      return null;
    }
  };

  // Run validation on mount
  useEffect(() => {
    runValidation(false);
  }, []);

  return {
    ...state,
    runValidation,
    validateSingleTable,
    isHealthy: !state.hasErrors && state.healthReport?.summary.totalErrors === 0
  };
};
