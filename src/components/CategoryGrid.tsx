
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Crown, Scale, Gavel, FileText, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    id: "pesquisar",
    title: "Pesquisar",
    icon: Search,
    color: "text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-500/30 to-blue-600/10",
    borderColor: "border-blue-500/40",
    hoverBorder: "hover:border-blue-400/60",
    glowColor: "hover:shadow-blue-500/20",
    path: "/pesquisar"
  },
  {
    id: "constituicao",
    title: "Constituição",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-500/30 to-yellow-600/10",
    borderColor: "border-amber-500/40",
    hoverBorder: "hover:border-amber-400/60",
    glowColor: "hover:shadow-amber-500/20",
    path: "/codigos/constituicao-federal"
  },
  {
    id: "codigos",
    title: "Códigos",
    icon: Scale,
    color: "text-law-accent",
    bgColor: "bg-gradient-to-br from-red-500/25 to-red-600/8",
    borderColor: "border-law-accent/40",
    hoverBorder: "hover:border-law-accent/60",
    glowColor: "hover:shadow-red-500/20",
    path: "/codigos?filter=código"
  },
  {
    id: "estatutos",
    title: "Estatutos",
    icon: Gavel,
    color: "text-violet-400",
    bgColor: "bg-gradient-to-br from-violet-500/30 to-purple-600/10",
    borderColor: "border-violet-500/40",
    hoverBorder: "hover:border-violet-400/60",
    glowColor: "hover:shadow-violet-500/20",
    path: "/codigos?filter=estatuto"
  },
  {
    id: "leis",
    title: "Leis",
    icon: FileText,
    color: "text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-500/30 to-teal-600/10",
    borderColor: "border-emerald-500/40",
    hoverBorder: "hover:border-emerald-400/60",
    glowColor: "hover:shadow-emerald-500/20",
    path: "/codigos?filter=lei"
  },
  {
    id: "comentarios",
    title: "Comentários",
    icon: Headphones,
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-br from-cyan-500/30 to-sky-600/10",
    borderColor: "border-cyan-500/40",
    hoverBorder: "hover:border-cyan-400/60",
    glowColor: "hover:shadow-cyan-500/20",
    path: "/audio-comentarios"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const CategoryGrid: React.FC = () => {
  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 mb-8"
    >
      {categories.map((category) => {
        const Icon = category.icon;
        
        return (
          <motion.div 
            key={category.id} 
            variants={item}
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
                  </div>
                  
                  <h3 className="font-serif font-semibold text-base md:text-xl mt-1 md:mt-2 text-netflix-red">
                    {category.title}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CategoryGrid;
