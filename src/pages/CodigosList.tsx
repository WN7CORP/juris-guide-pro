import { Link, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { fetchLegalCode } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { Volume, Search, Filter, Scale, Gavel, BookmarkCheck } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { motion } from "framer-motion";
const CodigosList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter');
  const [audioCommentsCount, setAudioCommentsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(initialFilter);
  const {
    favorites
  } = useFavoritesStore();
  useEffect(() => {
    const countAudioComments = async () => {
      const counts: Record<string, number> = {};
      for (const code of legalCodes) {
        try {
          const tableName = tableNameMap[code.id];
          if (!tableName) {
            counts[code.id] = 0;
            continue;
          }
          const articles = await fetchLegalCode(tableName);
          counts[code.id] = articles.filter(a => a.comentario_audio).length;
        } catch (error) {
          console.error(`Failed to count audio comments for ${code.id}:`, error);
          counts[code.id] = 0;
        }
      }
      setAudioCommentsCount(counts);
      setLoading(false);
    };
    countAudioComments();
  }, []);

  // Update URL when filter changes
  useEffect(() => {
    if (activeFilter) {
      setSearchParams({
        filter: activeFilter
      });
    } else {
      setSearchParams({});
    }
  }, [activeFilter, setSearchParams]);

  // Filter codes based on search and category
  const filteredCodes = legalCodes.filter(code => {
    const matchesSearch = searchTerm === "" || code.title.toLowerCase().includes(searchTerm.toLowerCase()) || code.description.toLowerCase().includes(searchTerm.toLowerCase()) || code.shortTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === null || code.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Group codes by category
  const groupedCodes = filteredCodes.reduce((acc, code) => {
    const category = code.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(code);
    return acc;
  }, {} as Record<string, typeof legalCodes>);

  // Proper category titles with icons
  const categoryInfo: Record<string, {
    title: string;
    icon: any;
  }> = {
    'código': {
      title: 'Códigos',
      icon: Scale
    },
    'estatuto': {
      title: 'Estatutos',
      icon: Gavel
    },
    'lei': {
      title: 'Leis',
      icon: Filter
    },
    'constituição': {
      title: 'Constituição',
      icon: Scale
    }
  };

  // Count favorited articles by code
  const getFavoriteCountByCode = (codeId: string) => {
    return favorites.filter(favId => favId.startsWith(codeId)).length;
  };

  // Animation variants
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  return <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6 pb-6 px-[11px]">
        <motion.h2 initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-2xl font-serif font-bold text-netflix-red mb-6">
          {activeFilter ? categoryInfo[activeFilter]?.title || 'Legislações' : 'Códigos, Estatutos e Leis'}
        </motion.h2>
        
        {/* Search and filter bar */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.1
      }} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Buscar legislação..." className="pl-10 pr-4 py-2 rounded-md bg-netflix-dark border border-gray-800 w-full focus:outline-none focus:ring-1 focus:ring-netflix-red" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(categoryInfo).map(([category, info]) => {
            const Icon = info.icon;
            return <button key={category} onClick={() => setActiveFilter(activeFilter === category ? null : category)} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all
                    ${activeFilter === category ? 'bg-netflix-red text-white' : 'bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800'}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {info.title}
                </button>;
          })}
          </div>
        </motion.div>
        
        {/* Display codes by category */}
        {Object.keys(groupedCodes).length > 0 ? <motion.div variants={container} initial="hidden" animate="show">
            {Object.entries(groupedCodes).map(([category, codes]) => {
          const CategoryIcon = categoryInfo[category]?.icon || Filter;
          return <motion.div key={category} variants={item} className="mb-8">
                  <h3 className="text-xl font-serif font-semibold text-law-accent mb-4 flex items-center">
                    <CategoryIcon className="mr-2 h-5 w-5" />
                    {categoryInfo[category]?.title || category}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {codes.map(code => <motion.div key={code.id} whileHover={{
                scale: 1.02
              }} className="h-full">
                        <Link to={`/codigos/${code.id}`} className="p-6 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 block h-full flex flex-col" onClick={() => {
                  // Store recently visited code
                  try {
                    const stored = localStorage.getItem('recentCodes') || '[]';
                    const recentCodes = JSON.parse(stored);
                    const updatedRecents = [code.id, ...recentCodes.filter((id: string) => id !== code.id)].slice(0, 5);
                    localStorage.setItem('recentCodes', JSON.stringify(updatedRecents));
                  } catch (e) {
                    console.error('Failed to update recent codes:', e);
                  }
                }}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif font-bold text-lg text-netflix-red">{code.title}</h4>
                            <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                              {code.shortTitle}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-2 flex-grow">{code.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-2">
                              {!loading && audioCommentsCount[code.id] > 0 && <div className="flex items-center text-xs text-gray-400">
                                  
                                  
                                </div>}
                              
                              {getFavoriteCountByCode(code.id) > 0 && <div className="flex items-center text-xs text-gray-400">
                                  <BookmarkCheck className="h-3 w-3 mr-1 text-green-400" />
                                  <span>{getFavoriteCountByCode(code.id)} favoritos</span>
                                </div>}
                            </div>
                            
                            
                          </div>
                        </Link>
                      </motion.div>)}
                  </div>
                </motion.div>;
        })}
          </motion.div> : <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="text-center py-10 bg-netflix-dark/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">Nenhuma legislação encontrada</p>
            {searchTerm && <button onClick={() => {
          setSearchTerm('');
          setActiveFilter(null);
        }} className="mt-2 text-netflix-red hover:underline">
                Limpar filtros
              </button>}
          </motion.div>}
      </main>
    </div>;
};
export default CodigosList;