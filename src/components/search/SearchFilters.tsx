
import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  filters: {
    category: string;
    area: string;
    hasAudio: boolean;
  };
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const areas = [
    { value: 'all', label: 'Todas as áreas' },
    { value: 'civil', label: 'Direito Civil' },
    { value: 'penal', label: 'Direito Penal' },
    { value: 'constitucional', label: 'Direito Constitucional' },
    { value: 'administrativo', label: 'Direito Administrativo' },
    { value: 'tributario', label: 'Direito Tributário' },
    { value: 'trabalhista', label: 'Direito Trabalhista' }
  ];

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      area: 'all',
      hasAudio: false
    });
  };

  const hasActiveFilters = filters.area !== 'all' || filters.hasAudio;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[
                filters.area !== 'all' ? 1 : 0,
                filters.hasAudio ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Área do Direito
              </label>
              <Select
                value={filters.area}
                onValueChange={(value) => onFiltersChange({ ...filters, area: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasAudio"
                checked={filters.hasAudio}
                onChange={(e) => onFiltersChange({ ...filters, hasAudio: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-law-accent focus:ring-law-accent"
              />
              <label htmlFor="hasAudio" className="text-sm text-gray-300">
                Apenas artigos with comentário em áudio
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
