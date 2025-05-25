
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTableValidation } from '@/hooks/useTableValidation';
import { AlertTriangle, CheckCircle, RefreshCw, Database, MessageSquare } from 'lucide-react';

export const SystemHealthDashboard = () => {
  const { healthReport, isValidating, runValidation, isHealthy } = useTableValidation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!healthReport) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando relatório de saúde...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { tables, commentSystem, summary } = healthReport;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Health Summary
            </div>
            <Button 
              onClick={() => runValidation(true)} 
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Revalidar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validTables}</div>
              <div className="text-sm text-gray-600">Tabelas Válidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.invalidTables}</div>
              <div className="text-sm text-gray-600">Tabelas com Problemas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.totalErrors}</div>
              <div className="text-sm text-gray-600">Total de Erros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.totalWarnings}</div>
              <div className="text-sm text-gray-600">Avisos</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            {isHealthy ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Sistema Saudável
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Problemas Detectados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comment System Health */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('comments')}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sistema de Comentários
            </div>
            <Badge variant={commentSystem.isValid ? 'outline' : 'destructive'}>
              {commentSystem.isValid ? 'OK' : 'Problemas'}
            </Badge>
          </CardTitle>
        </CardHeader>
        {expandedSections.has('comments') && (
          <CardContent>
            {commentSystem.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-600 mb-2">Erros:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {commentSystem.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {commentSystem.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-600 mb-2">Avisos:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {commentSystem.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {commentSystem.isValid && commentSystem.errors.length === 0 && commentSystem.warnings.length === 0 && (
              <p className="text-green-600">Sistema de comentários funcionando corretamente.</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Tables Health */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('tables')}
          >
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Saúde das Tabelas ({tables.length})
            </div>
            <Badge variant={summary.invalidTables > 0 ? 'destructive' : 'outline'}>
              {summary.invalidTables > 0 ? `${summary.invalidTables} com problemas` : 'Todas OK'}
            </Badge>
          </CardTitle>
        </CardHeader>
        {expandedSections.has('tables') && (
          <CardContent>
            <div className="space-y-4">
              {tables.map((table, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{table.tableName}</h4>
                    <div className="flex gap-2">
                      <Badge variant={table.exists ? 'outline' : 'destructive'}>
                        {table.exists ? 'Existe' : 'Não encontrada'}
                      </Badge>
                      {table.exists && (
                        <Badge variant={table.hasValidStructure ? 'outline' : 'secondary'}>
                          {table.hasValidStructure ? 'Estrutura OK' : 'Estrutura inválida'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {table.exists && (
                    <p className="text-sm text-gray-600 mb-2">
                      Registros: {table.recordCount}
                    </p>
                  )}
                  
                  {table.errors.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-600 text-sm mb-1">Erros:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {table.errors.map((error, errorIndex) => (
                          <li key={errorIndex} className="text-xs text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
