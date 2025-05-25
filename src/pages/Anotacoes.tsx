
import React from 'react';
import { Header } from '@/components/Header';
import { StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import AnnotationDashboard from '@/components/annotation/AnnotationDashboard';

const Anotacoes = () => {
  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <StickyNote className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-serif font-bold text-purple-400">
              Minhas Anotações
            </h1>
          </div>
          
          <AnnotationDashboard />
        </motion.div>
      </main>
    </div>
  );
};

export default Anotacoes;
