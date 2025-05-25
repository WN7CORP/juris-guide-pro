
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Save, X, Trash2, Star, StarOff, Plus, Tag, 
  Palette, AlertCircle, Circle, Flag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Annotation } from '@/hooks/useAnnotations';

interface AdvancedAnnotationEditorProps {
  articleId: string;
  articleNumber?: string;
  annotation?: Annotation;
  onSave: (content: string, options: {
    tags: string[];
    category: string;
    color: string;
    priority: 'low' | 'medium' | 'high';
    isFavorite: boolean;
  }) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const PRIORITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400', 
  high: 'text-red-400'
};

const COLOR_OPTIONS = [
  '#6366f1', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const CATEGORY_OPTIONS = [
  'general', 'importante', 'dúvida', 'estudo', 
  'revisão', 'jurisprudência', 'exemplo'
];

const AdvancedAnnotationEditor: React.FC<AdvancedAnnotationEditorProps> = ({
  articleId,
  articleNumber,
  annotation,
  onSave,
  onClose,
  onDelete
}) => {
  const [content, setContent] = useState(annotation?.content || '');
  const [tags, setTags] = useState<string[]>(annotation?.tags || []);
  const [category, setCategory] = useState(annotation?.category || 'general');
  const [color, setColor] = useState(annotation?.color || '#6366f1');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(annotation?.priority || 'medium');
  const [isFavorite, setIsFavorite] = useState(annotation?.isFavorite || false);
  const [newTag, setNewTag] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('O conteúdo da anotação não pode estar vazio');
      return;
    }

    onSave(content, {
      tags,
      category,
      color,
      priority,
      isFavorite
    });
    setUnsavedChanges(false);
    toast.success('Anotação salva com sucesso');
  };

  const handleChange = (field: string, value: any) => {
    setUnsavedChanges(true);
    
    switch (field) {
      case 'content':
        setContent(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'color':
        setColor(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'favorite':
        setIsFavorite(value);
        break;
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setUnsavedChanges(true);
  };

  const closeWithConfirmation = () => {
    if (unsavedChanges && content.trim() !== '') {
      if (window.confirm('Você tem alterações não salvas. Deseja salvar antes de fechar?')) {
        handleSave();
        return;
      }
    }
    onClose();
  };

  const PriorityIcon = priority === 'high' ? AlertCircle : priority === 'medium' ? Circle : Flag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-gray-800 bg-netflix-dark shadow-xl">
        <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <div className="text-lg font-semibold text-gray-100">
              {articleNumber ? `Anotação: Art. ${articleNumber}` : 'Anotação'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChange('favorite', !isFavorite)}
              className={`${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
            >
              {isFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={closeWithConfirmation} className="text-gray-300 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Conteúdo</label>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Digite suas anotações aqui..."
              className="min-h-[150px] bg-gray-900/50 border-gray-700 focus:ring-law-accent focus:border-law-accent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-800 text-gray-200 hover:bg-gray-700"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nova tag..."
                className="bg-gray-900/50 border-gray-700"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
                <PriorityIcon className={`h-4 w-4 ${PRIORITY_COLORS[priority]}`} />
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Cor
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => handleChange('color', colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === colorOption ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-800">
            <div>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
              disabled={!content.trim()}
              className="bg-law-accent hover:bg-law-accent/80"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AdvancedAnnotationEditor;
