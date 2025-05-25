
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { legalCodes, Article } from '@/data/legalCodes';
import { useStudyStore } from '@/store/studyStore';
import { Search, Filter, BookOpen, Clock, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SearchFilters {
  categories: string[];
  difficulty: string[];
  studyProgress: string[];
  hasExplanation: boolean;
  hasExample: boolean;
}

export const AdvancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    difficulty: [],
    studyProgress: [],
    hasExplanation: false,
    hasExample: false,
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const { cards } = useStudyStore();

  const categories = ['código', 'estatuto', 'lei', 'constituição'];
  const difficulties = ['easy', 'medium', 'hard'];
  const progressLevels = ['not-studied', 'in-progress', 'mastered'];

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim() && filters.categories.length === 0) return [];

    let results: Array<Article & { codeId: string; codeTitle: string; category: string }> = [];

    // Search through all legal codes
    legalCodes.forEach(code => {
      // Apply category filter
      if (filters.categories.length > 0 && !filters.categories.includes(code.category)) {
        return;
      }

      code.articles.forEach(article => {
        // Text search
        const matchesSearch = !searchTerm.trim() || 
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.title && article.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.explanation && article.explanation.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.practicalExample && article.practicalExample.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return;

        // Apply content filters
        if (filters.hasExplanation && !article.explanation) return;
        if (filters.hasExample && !article.practicalExample) return;

        // Get study card info if exists
        const studyCard = cards.find(c => c.articleId === article.id);

        // Apply difficulty filter
        if (filters.difficulty.length > 0) {
          const cardDifficulty = studyCard?.difficulty || 'medium';
          if (!filters.difficulty.includes(cardDifficulty)) return;
        }

        // Apply study progress filter
        if (filters.studyProgress.length > 0) {
          let progressLevel = 'not-studied';
          if (studyCard) {
            if (studyCard.timesReviewed === 0) progressLevel = 'not-studied';
            else if (studyCard.timesReviewed < 5) progressLevel = 'in-progress';
            else progressLevel = 'mastered';
          }
          if (!filters.studyProgress.includes(progressLevel)) return;
        }

        results.push({
          ...article,
          codeId: code.id,
          codeTitle: code.title,
          category: code.category,
        });
      });
    });

    return results.slice(0, 50); // Limit results
  }, [searchTerm, filters, cards]);

  const handleSearch = () => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      difficulty: [],
      studyProgress: [],
      hasExplanation: false,
      hasExample: false,
    });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'categories' | 'difficulty' | 'studyProgress', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const getProgressLevel = (articleId: string) => {
    const studyCard = cards.find(c => c.articleId === articleId);
    if (!studyCard) return 'not-studied';
    if (studyCard.timesReviewed === 0) return 'not-studied';
    if (studyCard.timesReviewed < 5) return 'in-progress';
    return 'mastered';
  };

  const getDifficultyBadge = (articleId: string) => {
    const studyCard = cards.find(c => c.articleId === articleId);
    const difficulty = studyCard?.difficulty || 'medium';
    
    const colors = {
      easy: 'bg-green-500/20 text-green-400 border-green-500',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      hard: 'bg-red-500/20 text-red-400 border-red-500'
    };
    
    return (
      <Badge className={colors[difficulty]}>
        {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
      </Badge>
    );
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

            {/* Study Difficulty */}
            {cards.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Dificuldade</h4>
                <div className="space-y-2">
                  {difficulties.map(difficulty => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox
                        id={difficulty}
                        checked={filters.difficulty.includes(difficulty)}
                        onCheckedChange={() => toggleArrayFilter('difficulty', difficulty)}
                      />
                      <label htmlFor={difficulty} className="text-sm text-gray-400">
                        {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Progress */}
            {cards.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Progresso</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="not-studied"
                      checked={filters.studyProgress.includes('not-studied')}
                      onCheckedChange={() => toggleArrayFilter('studyProgress', 'not-studied')}
                    />
                    <label htmlFor="not-studied" className="text-sm text-gray-400">
                      Não estudado
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-progress"
                      checked={filters.studyProgress.includes('in-progress')}
                      onCheckedChange={() => toggleArrayFilter('studyProgress', 'in-progress')}
                    />
                    <label htmlFor="in-progress" className="text-sm text-gray-400">
                      Em progresso
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mastered"
                      checked={filters.studyProgress.includes('mastered')}
                      onCheckedChange={() => toggleArrayFilter('studyProgress', 'mastered')}
                    />
                    <label htmlFor="mastered" className="text-sm text-gray-400">
                      Dominado
                    </label>
                  </div>
                </div>
              </div>
            )}
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
                        {cards.find(c => c.articleId === result.id) && getDifficultyBadge(result.id)}
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
        </div>
      </div>
    </div>
  );
};
