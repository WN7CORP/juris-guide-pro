
import React from 'react';
import { Header } from '@/components/Header';
import { StickyNote, Scale, Gavel, FileText, BookOpen, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAnnotations } from '@/hooks/useAnnotations';
import { legalCodes } from '@/data/legalCodes';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Anotacoes = () => {
  const { getAllAnnotations, deleteAnnotation } = useAnnotations();
  const annotations = getAllAnnotations();

  // Group annotations by legal code
  const annotationsByCode = annotations.reduce((acc, annotation) => {
    // Extract code ID from article ID (format: codeId-articleId)
    const parts = annotation.articleId.split('-');
    const codeId = parts[0];
    
    const code = legalCodes.find(c => c.id === codeId);
    const codeName = code?.title || 'Código não identificado';
    
    if (!acc[codeName]) {
      acc[codeName] = [];
    }
    acc[codeName].push({
      ...annotation,
      code,
      articleNumber: parts[1] || 'N/A'
    });
    
    return acc;
  }, {} as Record<string, any[]>);

  const getCodeIcon = (code: any) => {
    if (!code) return BookOpen;
    
    if (code.id === 'constituicao') return Crown;
    if (code.category === 'código') return Scale;
    if (code.category === 'estatuto') return Gavel;
    return FileText;
  };

  const getCodeColor = (code: any) => {
    if (!code) return 'text-gray-400';
    
    if (code.id === 'constituicao') return 'text-amber-400';
    if (code.category === 'código') return 'text-law-accent';
    if (code.category === 'estatuto') return 'text-purple-400';
    return 'text-emerald-400';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <StickyNote className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-serif font-bold text-purple-400">
              Minhas Anotações
            </h1>
          </div>
          
          {annotations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/40 p-8 rounded-lg text-center border border-gray-700/50"
            >
              <StickyNote className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-300 mb-2">
                Nenhuma anotação encontrada
              </h2>
              <p className="text-gray-400 mb-4">
                Comece a fazer anotações nos artigos para vê-las organizadas aqui.
              </p>
              <Link to="/pesquisar">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Pesquisar Artigos
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(annotationsByCode).map(([codeName, codeAnnotations], index) => {
                const IconComponent = getCodeIcon(codeAnnotations[0]?.code);
                const iconColor = getCodeColor(codeAnnotations[0]?.code);
                
                return (
                  <motion.div
                    key={codeName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className={`h-6 w-6 ${iconColor}`} />
                      <h2 className="text-xl font-serif font-medium text-law-accent">
                        {codeName}
                      </h2>
                      <span className="text-sm text-gray-400">
                        ({codeAnnotations.length} anotação{codeAnnotations.length !== 1 ? 'ões' : ''})
                      </span>
                    </div>
                    
                    <div className="grid gap-4">
                      {codeAnnotations.map((annotation) => (
                        <Card
                          key={annotation.articleId}
                          className="bg-netflix-dark border-gray-800 hover:border-gray-700 transition-all duration-200"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-medium text-netflix-red">
                                Art. {annotation.articleNumber}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={() => deleteAnnotation(annotation.articleId)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">
                              {formatDate(annotation.updatedAt)}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50">
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {annotation.content}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Anotacoes;
