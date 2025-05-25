
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  open: boolean;
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
  category,
  open
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
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 bg-gray-900 border-0 rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {existingAnnotation ? 'Editar Anotação' : 'Nova Anotação'}
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <h1 className="text-xl font-medium text-gray-100">
              {existingAnnotation ? 'Editar Anotação' : 'Nova Anotação'}
              {articleNumber && (
                <span className="text-sm text-gray-400 ml-2">
                  Art. {articleNumber}
                </span>
              )}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <Label htmlFor="content" className="text-gray-300 text-lg mb-3 block">
                  Conteúdo da Anotação
                </Label>
                <Textarea
                  id="content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua anotação aqui..."
                  className="min-h-[300px] bg-gray-800/50 border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300 mb-3 block text-base">Cor da Anotação</Label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
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
                  <Label className="text-gray-300 mb-3 block text-base">Prioridade</Label>
                  <div className="flex gap-3">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <Button
                        key={p}
                        variant={priority === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriority(p)}
                        className={`${
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
                <Label className="text-gray-300 mb-3 block text-base">Tags</Label>
                <div className="flex gap-3 mb-3">
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
                    className="bg-gray-800/50 border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    className="border-gray-600 shrink-0"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-900/20 hover:text-red-300"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`${
                    isFavorite 
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 p-4 text-center border-t border-gray-700">
            Dica: Use Ctrl+Enter para salvar rapidamente
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleAnnotationEditor;
