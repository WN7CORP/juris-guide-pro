
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, Trash2, History, Clock, Edit3, Search, Tag, Download, Type, Bold, Italic, List } from "lucide-react";
import { useSupabaseAnnotations } from "@/hooks/useSupabaseAnnotations";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AnnotationPanelProps {
  articleId: string;
  articleNumber?: string;
  onClose: () => void;
}

interface AnnotationHistory {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const AnnotationPanel = ({ articleId, articleNumber, onClose }: AnnotationPanelProps) => {
  const { getAnnotation, saveAnnotation, deleteAnnotation, getAllAnnotations } = useSupabaseAnnotations();
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [annotationHistory, setAnnotationHistory] = useState<AnnotationHistory[]>([]);
  const [activeTab, setActiveTab] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const existingAnnotation = getAnnotation(articleId);
    if (existingAnnotation) {
      setContent(existingAnnotation.content);
      updateCounts(existingAnnotation.content);
    }
    
    // Load annotation history for this article
    const allAnnotations = getAllAnnotations();
    const history = allAnnotations
      .filter(annotation => annotation.article_id === articleId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    setAnnotationHistory(history);
  }, [articleId, getAnnotation, getAllAnnotations]);

  const updateCounts = (text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("A anotação não pode estar vazia");
      return;
    }

    try {
      await saveAnnotation(articleId, content);
      setHasChanges(false);
      toast.success("Anotação salva com sucesso!");
      
      // Refresh history
      const allAnnotations = getAllAnnotations();
      const history = allAnnotations
        .filter(annotation => annotation.article_id === articleId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setAnnotationHistory(history);
    } catch (error) {
      toast.error("Erro ao salvar anotação");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta anotação?")) {
      try {
        await deleteAnnotation(articleId);
        setContent("");
        setHasChanges(false);
        setAnnotationHistory([]);
        updateCounts("");
        toast.success("Anotação excluída com sucesso!");
        onClose();
      } catch (error) {
        toast.error("Erro ao excluir anotação");
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(true);
    updateCounts(newContent);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const restoreFromHistory = (historyContent: string) => {
    setContent(historyContent);
    setHasChanges(true);
    setActiveTab("current");
    updateCounts(historyContent);
    toast.success("Anotação restaurada do histórico");
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const exportAnnotation = () => {
    const dataStr = JSON.stringify({
      article: articleNumber || articleId,
      content,
      tags,
      created: new Date().toISOString()
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `anotacao-art-${articleNumber || articleId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const insertFormatting = (format: 'bold' | 'italic' | 'list') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        newCursorPos = start + (selectedText ? 2 : 2);
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        newCursorPos = start + (selectedText ? 1 : 1);
        break;
      case 'list':
        newText = `\n• ${selectedText}`;
        newCursorPos = start + 3;
        break;
    }

    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    const updatedContent = beforeText + newText + afterText;
    
    setContent(updatedContent);
    setHasChanges(true);
    updateCounts(updatedContent);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const filteredHistory = annotationHistory.filter(annotation =>
    annotation.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="current" className="text-sm data-[state=active]:bg-purple-600">
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm data-[state=active]:bg-purple-600">
            <History className="h-4 w-4 mr-2" />
            Histórico ({annotationHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="flex-1 flex flex-col m-0">
          <div className="flex-1 p-4 space-y-4">
            {/* Formatting Tools */}
            <div className="flex gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <Button
                onClick={() => insertFormatting('bold')}
                size="sm"
                variant="outline"
                className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => insertFormatting('italic')}
                size="sm"
                variant="outline"
                className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => insertFormatting('list')}
                size="sm"
                variant="outline"
                className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <List className="h-3 w-3" />
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button
                onClick={exportAnnotation}
                size="sm"
                variant="outline"
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                disabled={!content.trim()}
              >
                <Download className="h-3 w-3 mr-1" />
                Exportar
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs border border-purple-600/30 cursor-pointer hover:bg-purple-600/30"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag..."
                  className="bg-gray-800 border-gray-600 text-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button
                  onClick={addTag}
                  size="sm"
                  variant="outline"
                  className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  <Tag className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Annotation Textarea */}
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder={`Digite suas anotações para ${articleNumber ? `o Art. ${articleNumber}` : 'este artigo'}...`}
                className="min-h-[300px] bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 resize-none"
              />
              
              {/* Character and Word Count */}
              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  {charCount} caracteres
                </span>
                <span>{wordCount} palavras</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 p-4 border-t border-gray-700">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || !content.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            {content.trim() && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0">
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar no histórico..."
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm 
                      ? "Nenhum resultado encontrado" 
                      : "Nenhum histórico de anotações encontrado"
                    }
                  </p>
                  <p className="text-sm mt-2">
                    {searchTerm 
                      ? "Tente termos de busca diferentes"
                      : "Suas alterações aparecerão aqui após salvar"
                    }
                  </p>
                </div>
              ) : (
                filteredHistory.map((annotation, index) => (
                  <div key={annotation.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatDate(annotation.updated_at)}
                        {index === 0 && (
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => restoreFromHistory(annotation.content)}
                        size="sm"
                        variant="outline"
                        className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs"
                      >
                        Restaurar
                      </Button>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-600">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {annotation.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnnotationPanel;
