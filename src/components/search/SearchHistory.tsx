
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSearchHistory, clearSearchHistory } from '@/utils/formatters';

interface SearchHistoryProps {
  onSelect: (term: string) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelect }) => {
  const history = getSearchHistory();

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma pesquisa anterior</p>
        <p className="text-sm">Suas pesquisas recentes aparecerão aqui</p>
      </div>
    );
  }

  const handleClearHistory = () => {
    clearSearchHistory();
    // Force a re-render by calling onSelect with empty string
    onSelect('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pesquisas Recentes
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-gray-400 hover:text-red-400"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>
      
      <div className="space-y-2">
        {history.map((entry: any, index: number) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(entry.term)}
            className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-200 group-hover:text-white font-medium">
                  {entry.term}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {entry.resultsCount} {entry.resultsCount === 1 ? 'resultado' : 'resultados'} • {' '}
                  {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Search className="h-4 w-4 text-gray-400 group-hover:text-law-accent" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
