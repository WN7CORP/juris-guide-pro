import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Search, Filter, SortAsc, Star, Tag, Calendar,
  TrendingUp, BookOpen, Clock, Heart, Trash2, Edit
} from 'lucide-react';
import { useAnnotations, Annotation, AnnotationFilters, SortOption } from '@/hooks/useAnnotations';
import { legalCodes } from '@/data/legalCodes';
import { Link } from 'react-router-dom';

interface AnnotationDashboardProps {
  highlightArticleId?: string;
}

const AnnotationDashboard: React.FC<AnnotationDashboardProps> = ({ highlightArticleId }) => {
  const { searchAnnotations, getAllTags, getAllCategories, getStatistics, deleteAnnotation, toggleFavorite } = useAnnotations();
  
  const [filters, setFilters] = useState<AnnotationFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const stats = getStatistics();
  const allTags = getAllTags();
  const allCategories = getAllCategories();

  // Auto-scroll to highlighted annotation
  useEffect(() => {
    if (highlightArticleId) {
      setTimeout(() => {
        const element = document.getElementById(`annotation-${highlightArticleId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightArticleId]);

  // Apply search and filters
  const filteredAnnotations = useMemo(() => {
    return searchAnnotations({
      ...filters,
      search: searchTerm
    }, sortBy);
  }, [searchAnnotations, filters, searchTerm, sortBy]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCodeInfo = (articleId: string) => {
    const parts = articleId.split('-');
    const codeId = parts[0];
    const code = legalCodes.find(c => c.id === codeId);
    return {
      code,
      articleNumber: parts[1] || 'N/A'
    };
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
    }
  };

  const handleFilterChange = (key: keyof AnnotationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-netflix-dark border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-dark border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Favoritas</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.favorites}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-dark border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-400">{stats.byPriority.high}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-dark border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Recentes</p>
                <p className="text-2xl font-bold text-law-accent">{stats.recentCount}</p>
              </div>
              <Clock className="h-8 w-8 text-law-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-netflix-dark border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200"
              >
                <option value="updatedAt">Mais recentes</option>
                <option value="createdAt">Data de criação</option>
                <option value="priority">Prioridade</option>
                <option value="alphabetical">Alfabética</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Categoria</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200"
                  >
                    <option value="">Todas</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Prioridade</label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200"
                  >
                    <option value="">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('isFavorite', !filters.isFavorite)}
                    className={`${filters.isFavorite ? 'bg-yellow-900/20 text-yellow-400' : ''}`}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Favoritas
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardHeader>
      </Card>

      {/* Annotations List */}
      <div className="space-y-4">
        {filteredAnnotations.length === 0 ? (
          <Card className="bg-netflix-dark border-gray-800">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                Nenhuma anotação encontrada
              </h3>
              <p className="text-gray-400">
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Tente ajustar os filtros ou termo de busca'
                  : 'Comece a fazer anotações nos artigos para vê-las aqui'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnotations.map((annotation) => {
            const { code, articleNumber } = getCodeInfo(annotation.articleId);
            const isHighlighted = highlightArticleId === annotation.articleId;
            
            return (
              <motion.div
                key={annotation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                id={`annotation-${annotation.articleId}`}
              >
                <Card className={`bg-netflix-dark border-gray-800 hover:border-gray-700 transition-all ${
                  isHighlighted ? 'ring-2 ring-purple-500 border-purple-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: annotation.color }}
                        />
                        <div>
                          <h3 className="font-medium text-law-accent">
                            Art. {articleNumber}
                          </h3>
                          {code && (
                            <p className="text-xs text-gray-400">{code.title}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(annotation.priority)}>
                          {annotation.priority === 'high' ? 'Alta' : 
                           annotation.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(annotation.articleId)}
                          className={annotation.isFavorite ? 'text-yellow-400' : 'text-gray-400'}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnnotation(annotation.articleId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 p-3 rounded-lg mb-3">
                      <p className="text-gray-300 whitespace-pre-wrap line-clamp-3">
                        {annotation.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {annotation.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatDate(annotation.updatedAt)}</span>
                        {code && (
                          <Link 
                            to={`/codigos/${code.id}?article=${annotation.articleId}`}
                            className="text-law-accent hover:underline"
                          >
                            Ver artigo
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AnnotationDashboard;
