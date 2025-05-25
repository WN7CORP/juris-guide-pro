
import { useState } from 'react';
import { Header } from '@/components/Header';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { ArticleComparison } from '@/components/comparison/ArticleComparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

const Pesquisar = () => {
  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-law-accent mb-2 text-center">
            Pesquisa e Comparação
          </h1>
          <p className="text-gray-400 text-center">
            Ferramentas avançadas para encontrar e comparar artigos
          </p>
        </motion.div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-netflix-dark">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Busca Avançada
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Comparar Artigos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <AdvancedSearch />
          </TabsContent>

          <TabsContent value="compare">
            <ArticleComparison />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Pesquisar;
