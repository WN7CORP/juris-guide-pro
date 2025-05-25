
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import AnnotationDashboard from '@/components/annotation/AnnotationDashboard';
import { useSearchParams } from 'react-router-dom';

const Anotacoes = () => {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('article');
  const articleNumber = searchParams.get('number');

  useEffect(() => {
    // If article ID is provided, we could scroll to it or highlight it
    if (articleId) {
      document.title = `Anotações${articleNumber ? ` - Art. ${articleNumber}` : ''} | Vade Mecum Premium 2025`;
    } else {
      document.title = 'Minhas Anotações | Vade Mecum Premium 2025';
    }
  }, [articleId, articleNumber]);

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6 px-3 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <StickyNote className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-purple-400">
              Minhas Anotações
              {articleNumber && (
                <span className="text-lg md:text-xl text-gray-400 ml-2">
                  - Art. {articleNumber}
                </span>
              )}
            </h1>
          </div>
          
          <AnnotationDashboard 
            highlightArticleId={articleId || undefined}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Anotacoes;
