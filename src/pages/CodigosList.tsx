
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { useState, useEffect } from "react";
import { fetchLegalCode } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { Volume } from "lucide-react";

const CodigosList = () => {
  const [audioCommentsCount, setAudioCommentsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
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
          
          const result = await fetchLegalCode(tableName as any);
          counts[code.id] = result.articles.filter(a => a.comentario_audio).length;
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
  
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 mt-14 md:mt-0">
        <h2 className="text-2xl font-serif font-bold text-netflix-red mb-6">
          Códigos e Estatutos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legalCodes.map((code) => (
            <Link
              key={code.id}
              to={`/codigos/${code.id}`}
              className="p-6 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg text-netflix-red">{code.title}</h3>
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
                  <div className="flex items-center text-xs bg-netflix-red/20 px-2 py-1 rounded-full text-netflix-red">
                    <Volume className="h-3 w-3 mr-1" />
                    <span>{audioCommentsCount[code.id]} áudios</span>
                  </div>
                )}
              </div>
              
              {/* Audio indicator badge for codes with audio comments */}
              {!loading && audioCommentsCount[code.id] > 0 && (
                <div className="absolute top-3 right-3 flex items-center justify-center h-6 w-6 rounded-full bg-netflix-red/10">
                  <Volume className="h-3 w-3 text-netflix-red" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CodigosList;
