
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { fetchLegalCode } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { Volume, Search, Filter, Scale, Gavel } from "lucide-react";

const CodigosList = () => {
  const [audioCommentsCount, setAudioCommentsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Get filter from URL if it exists
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

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

  // Filter codes based on search and category
  const filteredCodes = legalCodes.filter(code => {
    const matchesSearch = searchTerm === "" || 
      code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.shortTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  const categoryInfo: Record<string, {title: string, icon: any}> = {
    'código': {title: 'Códigos', icon: Scale},
    'estatuto': {title: 'Estatutos', icon: Gavel},
    'lei': {title: 'Leis', icon: Filter},
    'constituição': {title: 'Constituição', icon: Scale}
  };
  
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-6">
        <h2 className="text-2xl font-serif font-bold text-netflix-red mb-6">
          {activeFilter === 'código' ? 'Códigos' : 
           activeFilter === 'estatuto' ? 'Estatutos' : 
           'Códigos, Estatutos e Leis'}
        </h2>
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar legislação..."
              className="pl-10 pr-4 py-2 rounded-md bg-netflix-dark border border-gray-800 w-full focus:outline-none focus:ring-1 focus:ring-netflix-red"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(categoryInfo).map(([category, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(activeFilter === category ? null : category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1
                    ${activeFilter === category 
                      ? 'bg-netflix-red text-white' 
                      : 'bg-netflix-dark border border-gray-800 text-gray-300 hover:bg-gray-800'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {info.title}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Display codes by category */}
        {Object.keys(groupedCodes).length > 0 ? (
          Object.entries(groupedCodes).map(([category, codes]) => {
            const CategoryIcon = categoryInfo[category]?.icon || Filter;
            return (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-serif font-semibold text-law-accent mb-4 flex items-center">
                  <CategoryIcon className="mr-2 h-5 w-5" />
                  {categoryInfo[category]?.title || category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {codes.map((code) => (
                    <Link
                      key={code.id}
                      to={`/codigos/${code.id}`}
                      className="p-6 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-lg text-netflix-red">{code.title}</h4>
                        <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                          {code.shortTitle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{code.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-gray-500">
                          {code.articles.length} artigos
                        </p>
                        
                        {!loading && audioCommentsCount[code.id] > 0 && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Volume className="h-3 w-3 mr-1 text-law-accent" />
                            <span>{audioCommentsCount[code.id]} áudios</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">Nenhuma legislação encontrada</p>
            {searchTerm && (
              <button 
                onClick={() => {setSearchTerm(''); setActiveFilter(null)}}
                className="mt-2 text-netflix-red hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CodigosList;
