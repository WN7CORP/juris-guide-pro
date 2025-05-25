import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StickyNote, Scale, Gavel, FileText, BookOpen, Crown, Search, Plus, Filter, Calendar, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { useSupabaseAnnotations } from '@/hooks/useSupabaseAnnotations';
import { legalCodes } from '@/data/legalCodes';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Anotacoes = () => {
  const { user } = useAuth();
  const { annotations, loading, deleteAnnotation, updateAnnotation } = useSupabaseAnnotations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Helper function to parse article information from article_id
  const parseArticleInfo = (articleId: string) => {
    const parts = articleId.split('-');
    const codeId = parts[0];
    const articleNumber = parts[1] || 'S/N';
    
    const code = legalCodes.find(c => c.id === codeId);
    const codeTitle = code?.title || 'Código não identificado';
    
    return {
      codeId,
      codeTitle,
      articleNumber,
      code
    };
  };

  // Filter and sort annotations
  const filteredAndSortedAnnotations = React.useMemo(() => {
    let filtered = annotations.filter(annotation => {
      const matchesSearch = annotation.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           annotation.article_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      
      const { codeId, code } = parseArticleInfo(annotation.article_id);
      
      if (filterBy === 'códigos') return matchesSearch && code?.category === 'código';
      if (filterBy === 'estatutos') return matchesSearch && code?.category === 'estatuto';
      if (filterBy === 'constituição') return matchesSearch && codeId === 'constituicao';
      if (filterBy === 'leis') return matchesSearch && code?.category === 'lei';
      
      return matchesSearch;
    });

    // Sort annotations
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortBy === 'alphabetical') {
        return a.article_id.localeCompare(b.article_id);
      }
      return 0;
    });

    return filtered;
  }, [annotations, searchTerm, filterBy, sortBy]);

  // Group annotations by legal code and article
  const annotationsByCodeAndArticle = filteredAndSortedAnnotations.reduce((acc, annotation) => {
    const { codeTitle, articleNumber, code } = parseArticleInfo(annotation.article_id);
    
    if (!acc[codeTitle]) {
      acc[codeTitle] = {};
    }
    
    const articleKey = `Art. ${articleNumber}`;
    if (!acc[codeTitle][articleKey]) {
      acc[codeTitle][articleKey] = [];
    }
    
    acc[codeTitle][articleKey].push({
      ...annotation,
      code,
      articleNumber,
      codeTitle
    });
    
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditAnnotation = (annotation: any) => {
    setSelectedAnnotation(annotation);
    setEditContent(annotation.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAnnotation || !editContent.trim()) return;
    
    try {
      await updateAnnotation(selectedAnnotation.id, editContent);
      setIsEditDialogOpen(false);
      setSelectedAnnotation(null);
      setEditContent('');
      toast.success('Anotação atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar anotação');
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      await deleteAnnotation(annotationId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col dark bg-netflix-bg">
        <Header />
        
        <main className="flex-1 container pt-4 pb-6">
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
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/40 p-8 rounded-lg text-center border border-gray-700/50"
            >
              <StickyNote className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-300 mb-2">
                Faça login para ver suas anotações
              </h2>
              <p className="text-gray-400 mb-4">
                Entre em sua conta para acessar todas as suas anotações salvas.
              </p>
              <Link to="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Fazer Login
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col dark bg-netflix-bg">
        <Header />
        
        <main className="flex-1 container pt-4 pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando anotações...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-6">
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
            <span className="ml-auto text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-300">
              {annotations.length} {annotations.length === 1 ? 'anotação' : 'anotações'}
            </span>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="constituição">Constituição</SelectItem>
                <SelectItem value="códigos">Códigos</SelectItem>
                <SelectItem value="estatutos">Estatutos</SelectItem>
                <SelectItem value="leis">Leis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
                <SelectItem value="alphabetical">Alfabética</SelectItem>
              </SelectContent>
            </Select>
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
          ) : filteredAndSortedAnnotations.length === 0 ? (
            <div className="bg-gray-800/40 p-8 rounded-lg text-center border border-gray-700/50">
              <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-300 mb-2">
                Nenhuma anotação encontrada
              </h2>
              <p className="text-gray-400">
                Tente ajustar os filtros ou termo de pesquisa.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(annotationsByCodeAndArticle).map(([codeName, articles], codeIndex) => {
                const firstAnnotation = Object.values(articles)[0][0];
                const IconComponent = getCodeIcon(firstAnnotation?.code);
                const iconColor = getCodeColor(firstAnnotation?.code);
                const totalAnnotations = Object.values(articles).reduce((sum, annotations) => sum + annotations.length, 0);
                
                return (
                  <motion.div
                    key={codeName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: codeIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className={`h-6 w-6 ${iconColor}`} />
                      <h2 className="text-xl font-serif font-medium text-law-accent">
                        {codeName}
                      </h2>
                      <span className="text-sm text-gray-400">
                        ({totalAnnotations} anotação{totalAnnotations !== 1 ? 'ões' : ''})
                      </span>
                    </div>
                    
                    <div className="space-y-6">
                      {Object.entries(articles).map(([articleKey, articleAnnotations]) => (
                        <div key={`${codeName}-${articleKey}`} className="space-y-3">
                          <h3 className="text-lg font-medium text-netflix-red border-b border-gray-700 pb-2">
                            {articleKey}
                          </h3>
                          
                          <div className="grid gap-3">
                            {articleAnnotations.map((annotation, index) => (
                              <Card
                                key={annotation.id}
                                className="bg-netflix-dark border-gray-800 hover:border-gray-700 transition-all duration-200"
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(annotation.updated_at)}</span>
                                      <span className="text-gray-600">•</span>
                                      <span className="text-purple-400">Anotação #{index + 1}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                        onClick={() => handleEditAnnotation(annotation)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        onClick={() => handleDeleteAnnotation(annotation.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50">
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                      {annotation.content}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-netflix-dark border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-purple-400">
                Editar Anotação - {selectedAnnotation ? `Art. ${parseArticleInfo(selectedAnnotation.article_id).articleNumber}` : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Digite sua anotação..."
                className="min-h-[200px] bg-gray-800 border-gray-700"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Anotacoes;
