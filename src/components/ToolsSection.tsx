
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, StickyNote, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFavoritesStore } from "@/store/favoritesStore";

const toolsCategories = [
  {
    id: "favoritos",
    title: "Favoritos",
    icon: Bookmark,
    color: "text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-500/30 to-yellow-600/10",
    borderColor: "border-amber-500/40",
    hoverBorder: "hover:border-amber-400/60",
    glowColor: "hover:shadow-amber-500/20",
    description: "Acesse seus artigos favoritos",
    path: "/favoritos"
  },
  {
    id: "anotacoes",
    title: "Anotações",
    icon: StickyNote,
    color: "text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-500/30 to-violet-600/10",
    borderColor: "border-purple-500/40",
    hoverBorder: "hover:border-purple-400/60",
    glowColor: "hover:shadow-purple-500/20",
    description: "Gerencie suas anotações pessoais",
    path: "/anotacoes"
  }
];

export const ToolsSection: React.FC = () => {
  const { favorites } = useFavoritesStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="mb-8"
    >
      <h2 className="text-xl font-serif font-bold text-law-accent mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        Ferramentas
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {toolsCategories.map((category, index) => {
          const Icon = category.icon;
          const badge = category.id === 'favoritos' && favorites.length > 0 ? favorites.length.toString() : null;
          
          return (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.05, 
                transition: { duration: 0.2 },
              }}
              className="col-span-1"
            >
              <Link to={category.path} className="block h-full">
                <Card className={`bg-netflix-dark border-gray-800 h-full shadow-lg hover:shadow-2xl transition-all duration-300 ${category.borderColor} ${category.hoverBorder} ${category.glowColor} border overflow-hidden backdrop-blur-sm`}>
                  <CardContent className="p-4 md:p-6 flex flex-col items-center text-center h-full">
                    <div className={`p-3 rounded-full ${category.bgColor} ${category.borderColor} border my-2 md:my-3 shadow-lg relative backdrop-blur-sm`}>
                      <Icon className={`h-6 w-6 md:h-8 md:w-8 ${category.color} drop-shadow-sm`} />
                      {badge && (
                        <span className="absolute -top-2 -right-2 bg-netflix-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                          {badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-serif font-semibold text-base md:text-xl mt-1 md:mt-2 text-netflix-red">
                      {category.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 hidden md:block">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ToolsSection;
