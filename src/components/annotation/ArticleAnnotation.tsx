
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, X, Trash2, Bold, Italic, List, ListOrdered, 
  Link2, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AnnotationProps {
  articleId: string;
  articleNumber?: string;
  initialContent?: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

const ArticleAnnotation: React.FC<AnnotationProps> = ({
  articleId,
  articleNumber,
  initialContent = '',
  onSave,
  onClose
}) => {
  const [content, setContent] = useState(initialContent);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(content);
    setUnsavedChanges(false);
    toast.success('Anotação salva com sucesso');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setUnsavedChanges(true);
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar a anotação?')) {
      setContent('');
      setUnsavedChanges(true);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      prefix + selection + suffix + 
      content.substring(end);
    
    setContent(newContent);
    setUnsavedChanges(true);
    
    // Set cursor position after format is applied
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length, 
          end + prefix.length
        );
      }
    }, 0);
  };

  const insertList = (ordered: boolean) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    let newContent = content;
    
    // Insert at the beginning of the line
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const prefix = ordered ? '1. ' : '• ';
    
    newContent = 
      content.substring(0, lineStart) + 
      prefix + 
      content.substring(lineStart);
    
    setContent(newContent);
    setUnsavedChanges(true);
    
    // Set cursor position after list marker
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          lineStart + prefix.length, 
          lineStart + prefix.length
        );
      }
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:', 'https://');
    if (!url) return;
    
    const text = window.getSelection()?.toString() || 'link';
    insertFormatting(`[${text}](`, ')');
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    // Get selected text or current line
    const selection = content.substring(start, end);
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', end);
    const line = content.substring(
      lineStart, 
      lineEnd > -1 ? lineEnd : content.length
    );
    
    let newContent;
    let alignPrefix = '';
    
    // Remove existing alignment prefixes
    const cleanLine = line.replace(/^(→|←|↔)/, '').trim();
    
    // Add new alignment prefix
    switch (alignment) {
      case 'left':
        alignPrefix = '← ';
        break;
      case 'center':
        alignPrefix = '↔ ';
        break;
      case 'right':
        alignPrefix = '→ ';
        break;
    }
    
    newContent = 
      content.substring(0, lineStart) + 
      alignPrefix + cleanLine +
      content.substring(lineEnd > -1 ? lineEnd : content.length);
    
    setContent(newContent);
    setUnsavedChanges(true);
  };

  const closeWithConfirmation = () => {
    if (unsavedChanges && content.trim() !== '') {
      if (window.confirm('Você tem alterações não salvas. Deseja salvar antes de fechar?')) {
        handleSave();
      }
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-gray-800 bg-netflix-dark shadow-xl">
        <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-800">
          <div className="text-lg font-semibold text-gray-100">
            {articleNumber ? `Anotações: Art. ${articleNumber}` : 'Anotações'}
          </div>
          <Button variant="ghost" onClick={closeWithConfirmation} className="text-gray-300 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-800">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => insertFormatting('**')}
              title="Negrito"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => insertFormatting('_')}
              title="Itálico"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => insertList(false)}
              title="Lista com marcadores"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => insertList(true)}
              title="Lista numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={insertLink}
              title="Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-700 mx-1"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAlignment('left')}
              title="Alinhar à esquerda"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAlignment('center')}
              title="Centralizar"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAlignment('right')}
              title="Alinhar à direita"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Digite suas anotações aqui..."
            className="min-h-[200px] bg-gray-900/50 border-gray-700 focus:ring-law-accent focus:border-law-accent"
          />
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
              disabled={!unsavedChanges}
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

export default ArticleAnnotation;
