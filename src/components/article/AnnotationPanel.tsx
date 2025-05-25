
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, History, Clock, Edit3 } from "lucide-react";
import { useSupabaseAnnotations } from "@/hooks/useSupabaseAnnotations";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  useEffect(() => {
    const existingAnnotation = getAnnotation(articleId);
    if (existingAnnotation) {
      setContent(existingAnnotation.content);
    }
    
    // Load annotation history for this article
    const allAnnotations = getAllAnnotations();
    const history = allAnnotations
      .filter(annotation => annotation.article_id === articleId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    setAnnotationHistory(history);
  }, [articleId, getAnnotation, getAllAnnotations]);

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
        toast.success("Anotação excluída com sucesso!");
        onClose();
      } catch (error) {
        toast.error("Erro ao excluir anotação");
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
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
    toast.success("Anotação restaurada do histórico");
  };

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
          <div className="flex-1 p-4">
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder={`Digite suas anotações para ${articleNumber ? `o Art. ${articleNumber}` : 'este artigo'}...`}
              className="min-h-[300px] bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 resize-none"
            />
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
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {annotationHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico de anotações encontrado</p>
                  <p className="text-sm mt-2">Suas alterações aparecerão aqui após salvar</p>
                </div>
              ) : (
                annotationHistory.map((annotation, index) => (
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
