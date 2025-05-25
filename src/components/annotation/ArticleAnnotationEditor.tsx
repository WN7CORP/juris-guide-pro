
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Save, X, Tag, Star, Palette
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAnnotations, Annotation } from '@/hooks/useAnnotations';

interface ArticleAnnotationEditorProps {
  articleId: string;
  articleNumber?: string;
  existingAnnotation?: Annotation;
  onClose: () => void;
  category?: string;
}

const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6b7280'
];

const ArticleAnnotationEditor: React.FC<ArticleAnnotationEditorProps> = ({
  articleId,
  articleNumber,
  existingAnnotation,
  onClose,
  category
}) => {
  const { saveAnnotation } = useAnnotations();
  const [content, setContent] = useState(existingAnnotation?.content || '');
  const [tags, setTags] = useState<string[]>(existingAnnotation?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(existingAnnotation?.color || colors[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(existingAnnotation?.priority || 'medium');
  const [isFavorite, setIsFavorite] = useState(existingAnnotation?.isFavorite || false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Por favor, adicione um conteúdo para a anotação');
      return;
    }

    saveAnnotation(articleId, content, {
      tags,
      category: category || 'general',
      color: selectedColor,
      priority,
      isFavorite
    });

    toast.success(existingAnnotation ? 'Anotação atualizada!' : 'Anotação criada!');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-gray-700 bg-gray-900/50">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-100">
              {existingAnnotation ? 'Editar Anotação' : 'Nova Anotação'}
              {articleNumber && (
                <span className="text-sm text-gray-400 ml-2">
                  Art. {articleNumber}
                </span>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="content" className="text-gray-300">
                Conteúdo da Anotação
              </Label>
              <Textarea
                id="content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua anotação aqui..."
                className="min-h-[120px] bg-gray-800/50 border-gray-600 focus:ring-purple-500 focus:border-purple-500 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-white scale-110' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Prioridade</Label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={priority === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriority(p)}
                      className={`text-xs ${
                        priority === p 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-gray-600 text-gray-300'
                      }`}
                    >
                      {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Adicionar tag"
                  className="bg-gray-800/50 border-gray-600 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  className="border-gray-600"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-red-900/20 hover:text-red-300"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`${
                  isFavorite 
                    ? 'text-yellow-400 hover:text-yellow-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Star className="h-4 w-4 mr-1" />
                {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Dica: Use Ctrl+Enter para salvar rapidamente
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ArticleAnnotationEditor;
