
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { legalCodes, Article } from '@/data/legalCodes';
import { useStudyStore } from '@/store/studyStore';
import { Search, Filter, BookOpen, Clock, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SearchFilters {
  categories: string[];
  hasExplanation: boolean;
  hasExample: boolean;
}

export const AdvancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    hasExplanation: false,
    hasExample: false,
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const { cards } = useStudyStore();

  const categories = ['código', 'estatuto', 'lei', 'constituição'];

  const filteredResults = useMemo(() => {
    let results: Array<Article & { codeId: string; codeTitle: string; category: string }> = [];

    // Se não há termo de busca e nenhum filtro, não mostrar resultados
    if (!searchTerm.trim() && filters.categories.length === 0) {
      return [];
    }

    // Buscar em todos os códigos legais
    legalCodes.forEach(code => {
      // Aplicar filtro de categoria
      if (filters.categories.length > 0 && !filters.categories.includes(code.category)) {
        return;
      }

      code.articles.forEach(article => {
        // Busca de texto
        const matchesSearch = !searchTerm.trim() || 
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.title && article.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.explanation && article.explanation.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.practicalExample && article.practicalExample.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return;

        // Aplicar filtros de conteúdo
        if (filters.hasExplanation && !article.explanation) return;
        if (filters.hasExample && !article.practicalExample) return;

        results.push({
          ...article,
          codeId: code.id,
          codeTitle: code.title,
          category: code.category,
        });
      });
    });

    return results.slice(0, 50); // Limitar resultados
  }, [searchTerm, filters, cards]);

  const handleSearch = () => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      hasExplanation: false,
      hasExample: false,
    });
  };

  const toggleArrayFilter = (key: 'categories', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-netflix-dark border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-law-accent">
            <Search className="h-5 w-5" />
            Busca Avançada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar em artigos, explicações e exemplos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-law-accent hover:bg-law-accent/80">
              Buscar
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400">Recentes:</span>
              {searchHistory.map((term, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-law-accent/20"
                  onClick={() => setSearchTerm(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 bg-netflix-dark border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-law-accent">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-gray-300 mb-3">Categorias</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayFilter('categories', category)}
                    />
                    <label htmlFor={category} className="text-sm text-gray-400 capitalize">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Filters */}
            <div>
              <h4 className="font-medium text-gray-300 mb-3">Conteúdo</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="explanation"
                    checked={filters.hasExplanation}
                    onCheckedChange={(checked) => updateFilter('hasExplanation', checked)}
                  />
                  <label htmlFor="explanation" className="text-sm text-gray-400">
                    Com explicação
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="example"
                    checked={filters.hasExample}
                    onCheckedChange={(checked) => updateFilter('hasExample', checked)}
                  />
                  <label htmlFor="example" className="text-sm text-gray-400">
                    Com exemplo prático
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-300">
              {filteredResults.length} resultado(s) encontrado(s)
            </h3>
          </div>

          <div className="space-y-4">
            {filteredResults.map((result, index) => (
              <motion.div
                key={`${result.codeId}-${result.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-netflix-dark border-gray-800 hover:border-law-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-law-accent border-law-accent">
                          {result.number}
                        </Badge>
                        <Badge variant="secondary">
                          {result.category}
                        </Badge>
                      </div>
                      <Link 
                        to={`/codigos/${result.codeId}?article=${result.id}`}
                        className="text-law-accent hover:text-law-accent/80"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Link>
                    </div>

                    <h4 className="font-medium text-gray-200 mb-2">
                      {result.codeTitle}
                    </h4>

                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                      {result.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {result.explanation && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Com explicação
                        </span>
                      )}
                      {result.practicalExample && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Com exemplo
                        </span>
                      )}
                      {cards.find(c => c.articleId === result.id) && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          No modo estudo
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {searchTerm.trim() && filteredResults.length === 0 && (
            <Card className="bg-netflix-dark border-gray-800">
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-400">
                  Tente ajustar os filtros ou usar termos diferentes
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial state */}
          {!searchTerm.trim() && filters.categories.length === 0 && (
            <Card className="bg-netflix-dark border-gray-800">
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Digite algo para buscar
                </h3>
                <p className="text-gray-400">
                  Use a barra de busca acima para encontrar artigos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
