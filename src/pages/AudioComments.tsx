
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { LegalArticle, fetchLegalCode } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { tableNameMap } from "@/utils/tableMapping";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume } from "lucide-react";
import AudioCommentPlaylist from "@/components/AudioCommentPlaylist";

const AudioComments = () => {
  const [articlesMap, setArticlesMap] = useState<Record<string, LegalArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Total count of articles with audio comments
  const totalAudioArticles = Object.values(articlesMap).reduce(
    (total, articles) => total + articles.length, 0
  );
  
  useEffect(() => {
    const loadArticlesWithAudio = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const articlesWithAudioMap: Record<string, LegalArticle[]> = {};
        
        // Fetch articles from all codes
        for (const code of legalCodes) {
          const tableName = tableNameMap[code.id];
          if (!tableName) continue;
          
          try {
            const articles = await fetchLegalCode(tableName as any);
            const articlesWithAudio = articles.filter(article => article.comentario_audio);
            
            if (articlesWithAudio.length > 0) {
              articlesWithAudioMap[code.id] = articlesWithAudio;
            } else {
              articlesWithAudioMap[code.id] = [];
            }
          } catch (codeError) {
            console.error(`Error loading articles for ${code.title}:`, codeError);
            articlesWithAudioMap[code.id] = [];
          }
        }
        
        setArticlesMap(articlesWithAudioMap);
      } catch (err) {
        console.error("Failed to load audio comments:", err);
        setError("Falha ao carregar comentários em áudio. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    loadArticlesWithAudio();
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-4 mx-auto px-3 md:px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-law-accent flex items-center gap-2 mb-2">
            <Volume className="h-5 w-5" /> 
            Comentários em Áudio
          </h1>
          <p className="text-gray-400 text-sm">
            {loading 
              ? "Carregando comentários em áudio..." 
              : `${totalAudioArticles} artigos comentados disponíveis para ouvir`}
          </p>
        </div>
        
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-800 rounded-md p-4">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <AudioCommentPlaylist articlesMap={articlesMap} />
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default AudioComments;
