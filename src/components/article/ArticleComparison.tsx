
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
}

interface ArticleComparisonProps {
  articles: Article[];
  onClose: () => void;
}

const ArticleComparison: React.FC<ArticleComparisonProps> = ({ articles, onClose }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'explanation' | 'formal' | 'example'>('content');

  // Memoize the comparison elements to prevent unnecessary re-renders
  const contentComparison = useMemo(() => {
    return articles.map(article => (
      <div key={`content-${article.id}`} className="p-4">
        <h4 className="font-serif font-semibold text-law-accent mb-2">
          {article.number ? `Art. ${article.number}` : article.title || 'Artigo'}
        </h4>
        <div className="whitespace-pre-line text-sm">
          {article.content}
        </div>
      </div>
    ));
  }, [articles]);

  const explanationComparison = useMemo(() => {
    return articles.map(article => (
      <div key={`explanation-${article.id}`} className="p-4">
        <h4 className="font-serif font-semibold text-law-accent mb-2">
          {article.number ? `Art. ${article.number}` : article.title || 'Artigo'} - Explicação Técnica
        </h4>
        <div className="whitespace-pre-line text-sm">
          {article.explanation || 'Não há explicação técnica disponível para este artigo.'}
        </div>
      </div>
    ));
  }, [articles]);

  const formalComparison = useMemo(() => {
    return articles.map(article => (
      <div key={`formal-${article.id}`} className="p-4">
        <h4 className="font-serif font-semibold text-law-accent mb-2">
          {article.number ? `Art. ${article.number}` : article.title || 'Artigo'} - Explicação Formal
        </h4>
        <div className="whitespace-pre-line text-sm">
          {article.formalExplanation || 'Não há explicação formal disponível para este artigo.'}
        </div>
      </div>
    ));
  }, [articles]);

  const exampleComparison = useMemo(() => {
    return articles.map(article => (
      <div key={`example-${article.id}`} className="p-4">
        <h4 className="font-serif font-semibold text-law-accent mb-2">
          {article.number ? `Art. ${article.number}` : article.title || 'Artigo'} - Exemplo Prático
        </h4>
        <div className="whitespace-pre-line text-sm">
          {article.practicalExample || 'Não há exemplo prático disponível para este artigo.'}
        </div>
      </div>
    ));
  }, [articles]);

  // Determine which comparison to show based on the active tab
  const getActiveComparison = () => {
    switch (activeTab) {
      case 'explanation':
        return explanationComparison;
      case 'formal':
        return formalComparison;
      case 'example':
        return exampleComparison;
      default:
        return contentComparison;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed ${fullscreen ? 'top-0 left-0 right-0 bottom-0 z-50' : 'bottom-16 left-4 right-4 top-auto z-40 md:left-auto md:right-4 md:top-20 md:bottom-auto md:w-2/3'}`}
    >
      <Card className="overflow-hidden h-full bg-netflix-dark border-gray-800">
        <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-800">
          <h3 className="text-lg font-semibold text-gray-100">Comparação de Artigos</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              className="text-gray-300 hover:text-white"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex border-b border-gray-800 bg-gray-900/50">
          <Button 
            variant={activeTab === 'content' ? 'default' : 'ghost'} 
            className={`rounded-none ${activeTab === 'content' ? 'bg-law-accent text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('content')}
          >
            Conteúdo
          </Button>
          <Button 
            variant={activeTab === 'explanation' ? 'default' : 'ghost'} 
            className={`rounded-none ${activeTab === 'explanation' ? 'bg-law-accent text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('explanation')}
          >
            Técnica
          </Button>
          <Button 
            variant={activeTab === 'formal' ? 'default' : 'ghost'} 
            className={`rounded-none ${activeTab === 'formal' ? 'bg-law-accent text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('formal')}
          >
            Formal
          </Button>
          <Button 
            variant={activeTab === 'example' ? 'default' : 'ghost'} 
            className={`rounded-none ${activeTab === 'example' ? 'bg-law-accent text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('example')}
          >
            Exemplo
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(100%-6rem)] grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-netflix-dark">
          {getActiveComparison()}
        </div>
      </Card>
    </motion.div>
  );
};

export default ArticleComparison;
