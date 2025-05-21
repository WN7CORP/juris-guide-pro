
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, ChevronRight, X, Book, MessageCircle, 
  Lightbulb, CheckCircle, Volume2, VolumeX
} from 'lucide-react';

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  comentario_audio?: string;
}

interface StudyModeProps {
  articles: Article[];
  initialIndex?: number;
  onClose: () => void;
}

enum ViewMode {
  Content,
  Explanation,
  Example,
  All
}

const StudyMode: React.FC<StudyModeProps> = ({ articles, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Content);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [markedArticles, setMarkedArticles] = useState<string[]>([]);
  const [fade, setFade] = useState(false);

  const currentArticle = articles[currentIndex];
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, articles.length]);

  const handleNext = () => {
    if (currentIndex < articles.length - 1) {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setFade(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setFade(false);
      }, 200);
    }
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    // Audio playback logic would go here
  };

  const toggleMarked = () => {
    if (markedArticles.includes(currentArticle.id)) {
      setMarkedArticles(markedArticles.filter(id => id !== currentArticle.id));
    } else {
      setMarkedArticles([...markedArticles, currentArticle.id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-gray-800 bg-netflix-dark overflow-hidden">
          <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Book className="text-law-accent h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-100">Modo Estudo</h3>
              <span className="text-gray-400 text-sm">
                {currentIndex + 1} de {articles.length}
              </span>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-300 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentArticle.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: fade ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-law-accent">
                    {currentArticle.number ? `Art. ${currentArticle.number}` : currentArticle.title || 'Artigo'}
                  </h2>
                  
                  <div className="flex gap-2">
                    {currentArticle.comentario_audio && (
                      <Button
                        variant={isAudioPlaying ? "default" : "outline"}
                        size="sm"
                        onClick={toggleAudio}
                        className={isAudioPlaying ? "bg-law-accent text-white" : ""}
                      >
                        {isAudioPlaying ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
                        {isAudioPlaying ? "Pausar" : "Ouvir"}
                      </Button>
                    )}
                    
                    <Button
                      variant={markedArticles.includes(currentArticle.id) ? "default" : "outline"}
                      size="sm"
                      onClick={toggleMarked}
                      className={markedArticles.includes(currentArticle.id) ? "bg-green-600 text-white" : ""}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {markedArticles.includes(currentArticle.id) ? "Marcado" : "Marcar"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {(viewMode === ViewMode.Content || viewMode === ViewMode.All) && (
                    <div className="bg-gray-900/30 p-4 rounded-md border border-gray-800">
                      <h3 className="font-semibold text-gray-200 mb-2">Conteúdo</h3>
                      <div className="whitespace-pre-line text-gray-300">
                        {currentArticle.content}
                      </div>
                    </div>
                  )}
                  
                  {(viewMode === ViewMode.Explanation || viewMode === ViewMode.All) && currentArticle.explanation && (
                    <div className="bg-gray-900/30 p-4 rounded-md border border-gray-800">
                      <h3 className="font-semibold text-gray-200 mb-2 flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        Explicação Técnica
                      </h3>
                      <div className="whitespace-pre-line text-gray-300">
                        {currentArticle.explanation}
                      </div>
                    </div>
                  )}
                  
                  {(viewMode === ViewMode.Example || viewMode === ViewMode.All) && currentArticle.practicalExample && (
                    <div className="bg-gray-900/30 p-4 rounded-md border border-gray-800">
                      <h3 className="font-semibold text-gray-200 mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Exemplo Prático
                      </h3>
                      <div className="whitespace-pre-line text-gray-300">
                        {currentArticle.practicalExample}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="bg-gray-900/50 p-3 border-t border-gray-800 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === ViewMode.Content ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(ViewMode.Content)}
                className={viewMode === ViewMode.Content ? "bg-law-accent text-white" : ""}
              >
                Conteúdo
              </Button>
              <Button
                variant={viewMode === ViewMode.Explanation ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(ViewMode.Explanation)}
                className={viewMode === ViewMode.Explanation ? "bg-law-accent text-white" : ""}
                disabled={!currentArticle.explanation}
              >
                Técnica
              </Button>
              <Button
                variant={viewMode === ViewMode.Example ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(ViewMode.Example)}
                className={viewMode === ViewMode.Example ? "bg-law-accent text-white" : ""}
                disabled={!currentArticle.practicalExample}
              >
                Exemplo
              </Button>
              <Button
                variant={viewMode === ViewMode.All ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(ViewMode.All)}
                className={viewMode === ViewMode.All ? "bg-law-accent text-white" : ""}
              >
                Todos
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === articles.length - 1}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudyMode;
