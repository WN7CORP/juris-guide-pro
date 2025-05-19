
import { useState, useCallback } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen, X, ExternalLink, Highlighter, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TextToSpeech } from "@/components/TextToSpeech";
import { TextHighlighter } from "@/components/TextHighlighter";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  items?: string[];
  paragraphs?: string[];
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
}

interface Highlight {
  text: string;
  color: string;
}

interface Annotation {
  text: string;
  note: string;
}

interface ArticleViewProps {
  article: Article;
  onNarrate?: () => void;
}

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);
  
  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // State for highlights and annotations
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Add highlight handler
  const handleHighlight = useCallback((text: string, color: string) => {
    setHighlights(prev => [...prev, { text, color }]);
  }, []);

  // Add annotation handler
  const handleAnnotate = useCallback((text: string, note: string) => {
    setAnnotations(prev => [...prev, { text, note }]);
  }, []);

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  // Handler for full article narration
  const handleNarrateArticle = () => {
    const fullText = `Artigo ${article.number || ""}: ${article.content}`;
    // The TextToSpeech component will handle the actual speech synthesis
  };

  // Apply highlights to content
  const highlightedContent = (text: string) => {
    let result = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.text})`, 'gi');
      result = result.replace(regex, `<span class="bg-opacity-40" style="background-color: ${highlight.color};">$1</span>`);
    });
    return result;
  };

  const renderDialog = () => {
    if (!activeDialog) return null;
    
    let title = '';
    let content = '';
    let IconComponent = Info;
    
    switch(activeDialog) {
      case 'explanation':
        title = 'Explicação Técnica';
        content = article.explanation || '';
        IconComponent = Info;
        break;
      case 'formal':
        title = 'Explicação Formal';
        content = article.formalExplanation || '';
        IconComponent = BookText;
        break;
      case 'example':
        title = 'Exemplo Prático';
        content = article.practicalExample || '';
        IconComponent = BookOpen;
        break;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-background-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-law-accent">
              <IconComponent className="h-5 w-5" />
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <TextToSpeech 
                text={content} 
                label="" 
                tooltipText={`Narrar ${title}`} 
                compact 
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveDialog(null)}
                className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </div>
          </div>
          <div className="p-4 text-sm text-gray-300 space-y-3">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    );
  };

  // Show annotations dialog
  const [showAnnotations, setShowAnnotations] = useState(false);
  
  const renderAnnotationsDialog = () => {
    if (!showAnnotations) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-background-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <h3 className="font-medium text-lg">Suas Anotações</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAnnotations(false)}
              className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          <div className="p-4">
            {annotations.length > 0 ? (
              <div className="space-y-4">
                {annotations.map((annotation, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-sm font-medium mb-1">Trecho:</p>
                    <div className="p-2 bg-gray-700/30 rounded mb-2 text-sm">
                      "{annotation.text}"
                    </div>
                    <p className="text-sm font-medium mb-1">Anotação:</p>
                    <p className="text-sm">{annotation.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-400">
                Você não tem anotações para este artigo.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:shadow-lg hover:border-gray-700 relative animate-fade-in">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {article.number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
              Art. {article.number}
            </h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-law-accent hover:bg-background-dark flex-shrink-0"
            onClick={toggleFavorite}
            aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {articleIsFavorite ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="legal-article-content text-sm whitespace-pre-line mb-3">
        {contentLines.map((line, index) => (
          <p key={index} className="mb-1.5 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: highlightedContent(line) }} />
        ))}
      </div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1 text-sm"
               dangerouslySetInnerHTML={{ __html: highlightedContent(item) }} />
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1 text-sm italic"
               dangerouslySetInnerHTML={{ __html: highlightedContent(paragraph) }} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <TextToSpeech text={article.content} compact={false} />
          <TextHighlighter 
            onHighlight={handleHighlight} 
            onAnnotate={handleAnnotate}
            compact={false} 
          />
          {annotations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnotations(true)}
              className="text-xs flex gap-1 h-9 px-3 rounded-md bg-gray-800/60 border-gray-700 hover:bg-gray-700"
            >
              <BookOpen className="h-4 w-4" />
              Ver Anotações ({annotations.length})
            </Button>
          )}
        </div>

        {hasExplanations && (
          <div className="flex flex-wrap gap-2">
            {article.explanation && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('explanation')}
              >
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Explicação Técnica</span>
                <span className="sm:hidden">Técnica</span>
              </Button>
            )}

            {article.formalExplanation && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('formal')}
              >
                <BookText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Explicação Formal</span>
                <span className="sm:hidden">Formal</span>
              </Button>
            )}

            {article.practicalExample && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('example')}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exemplo Prático</span>
                <span className="sm:hidden">Exemplo</span>
              </Button>
            )}
          </div>
        )}
      </div>
      
      {renderDialog()}
      {renderAnnotationsDialog()}
    </article>
  );
};

export default ArticleView;
