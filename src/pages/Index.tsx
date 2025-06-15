
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { useAudioPlayerStore } from "@/store/audioPlayerStore";
import { Volume, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { getArticlesWithAudioComments } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { NewsCarousel } from "@/components/NewsCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ToolsSection } from "@/components/ToolsSection";

const Index = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [latestAudioComments, setLatestAudioComments] = useState<any[]>([]);
  
  const { currentAudioId } = useAudioPlayerStore();

  // Load recent codes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentCodes');
    if (stored) {
      try {
        setRecentCodes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent codes:', e);
      }
    }
  }, []);

  // Load latest audio comments
  useEffect(() => {
    const loadLatestAudioComments = async () => {
      try {
        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        const results = await getArticlesWithAudioComments(tableNames);

        const audioArticles: any[] = [];
        results.forEach(result => {
          const codeInfo = Object.entries(tableNameMap)
            .find(([id, name]) => name === result.codeId);
          
          if (codeInfo) {
            const [codeId] = codeInfo;
            const codeTitle = legalCodes.find(code => code.id === codeId)?.title || codeId;
            
            result.articles.forEach(article => {
              if (article.comentario_audio) {
                audioArticles.push({
                  codeId,
                  codeTitle,
                  article,
                  audioUrl: article.comentario_audio
                });
              }
            });
          }
        });

        // Sort by most recent (assuming higher IDs are more recent)
        audioArticles.sort((a, b) => parseInt(b.article.id || '0') - parseInt(a.article.id || '0'));
        setLatestAudioComments(audioArticles.slice(0, 6)); // Show up to 6 in carousel
      } catch (error) {
        console.error('Failed to load latest audio comments:', error);
      }
    };

    loadLatestAudioComments();
  }, []);

  useEffect(() => {
    // Check if audio is playing and update the state
    setIsAudioPlaying(!!currentAudioId);
  }, [currentAudioId]);

  // Get recent codes
  const recentVisitedCodes = recentCodes.map(codeId => 
    legalCodes.find(code => code.id === codeId)
  ).filter(Boolean).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg bg-gradient-to-b from-netflix-bg to-netflix-dark">
      <Header />
      
      <main className="flex-1 container pt-4 pb-20 md:pb-6 animate-fade-in py-[19px] px-[17px]">
        <section className="mb-8">
          {/* News Carousel - Strategic placement at top */}
          <NewsCarousel audioComments={latestAudioComments} />

          {/* Main Category Grid */}
          <CategoryGrid />

          {/* Tools Section */}
          <ToolsSection />
        </section>
        
        {/* Recent Codes - Only if exists and more compact */}
        {recentVisitedCodes.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-serif font-bold text-law-accent mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Recentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentVisitedCodes.map((code, index) => 
                code && (
                  <motion.div 
                    key={code.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link 
                      to={`/codigos/${code.id}`} 
                      className="block p-3 bg-netflix-dark border border-gray-800 rounded-md hover:bg-netflix-dark/70 transition-colors"
                    >
                      <h3 className="font-medium text-netflix-red mb-1">{code.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{code.description}</p>
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.section>
        )}

        {/* Featured Legislation - Limited to 6 items */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-serif font-bold text-law-accent mb-6 text-shadow-sm flex items-center">
              <Scale className="mr-2 h-6 w-6" />
              Legislações em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalCodes.slice(0, 6).map((code, index) => (
                <motion.div 
                  key={code.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <Link 
                    to={`/codigos/${code.id}`} 
                    className="p-4 bg-gradient-to-br from-netflix-dark to-netflix-bg border border-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex items-center mb-2">
                      <Scale className="mr-2 h-5 w-5 text-law-accent" />
                      <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 flex-grow">{code.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                        {code.shortTitle}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex justify-center mt-6"
            >
              <Link 
                to="/codigos" 
                className="text-law-accent hover:text-law-accent/80 underline underline-offset-4 transition-colors hover:scale-105 inline-flex items-center gap-1"
              >
                Ver todas as legislações
              </Link>
            </motion.div>
          </motion.div>
        </section>
        
        {/* Audio playback indicator */}
        {isAudioPlaying && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-law-accent/90 p-3 rounded-full shadow-lg animate-pulse"
          >
            <Link to="/audio-comentarios" className="flex items-center gap-2">
              <Volume className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium hidden md:inline-block">
                Reproduzindo áudio
              </span>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
