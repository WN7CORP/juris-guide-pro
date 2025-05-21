import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Headphones, BookOpen, FileText, Scale, BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { KNOWN_TABLES } from "@/utils/tableMapping";
import { LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { categorizeLegalCode } from "@/utils/formatters";
import { legalCodes } from "@/data/legalCodes";
import AudioCommentPlaylist, { globalAudioState } from "@/components/AudioCommentPlaylist";
import { AudioCategorySelector } from "@/components/audio/AudioCategorySelector";
import { AudioFocusMode } from "@/components/audio/AudioFocusMode";

interface CodeWithAudioInfo {
  id: string;
  title: string;
  category: "códigos" | "estatutos" | "constituição" | "leis";
  icon: JSX.Element;
  audioCount: number;
}

// Function to safely cast table names for TypeScript
function safeTableCast(tableName: string) {
  return tableName as any;
}

const AudioComments = () => {
  // States for the UI
  const [isLoading, setIsLoading] = useState(true);
  const [codesWithAudio, setCodesWithAudio] = useState<CodeWithAudioInfo[]>([]);
  const [articlesMap, setArticlesMap] = useState<Record<string, LegalArticle[]>>({});
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [focusedArticle, setFocusedArticle] = useState<LegalArticle | null>(null);
  
  // Get icon for legal code
  const getCodeIcon = (codeId: string) => {
    const category = categorizeLegalCode(codeId);
    
    switch (category) {
      case 'códigos':
        return <BookOpen className="h-5 w-5 text-blue-400" />;
      case 'constituição':
        return <FileText className="h-5 w-5 text-amber-400" />;
      case 'estatutos':
        return <BookmarkCheck className="h-5 w-5 text-green-400" />;
      case 'leis':
        return <Scale className="h-5 w-5 text-red-400" />;
      default:
        return <Headphones className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get code title by ID
  const getCodeTitle = (tableId: string): string => {
    // First try to find in legalCodes
    const matchingCode = legalCodes.find(c => c.id && tableId.includes(c.id.toLowerCase()));
    if (matchingCode) {
      return matchingCode.title;
    }
    
    // If not found, format the table name as a title
    return tableId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('De', 'de')
      .replace('Da', 'da')
      .replace('Do', 'do')
      .replace('Dos', 'dos')
      .replace('Das', 'das');
  };

  // Load audio comments from Supabase
  useEffect(() => {
    const fetchAudioComments = async () => {
      setIsLoading(true);
      
      try {
        const codesWithAudioData: CodeWithAudioInfo[] = [];
        const articlesMapData: Record<string, LegalArticle[]> = {};
        
        // Create batches for parallel processing
        const batchSize = 5;
        for (let i = 0; i < KNOWN_TABLES.length; i += batchSize) {
          const batchTables = KNOWN_TABLES.slice(i, i + batchSize);
          
          const batchPromises = batchTables.map(async (tableName) => {
            try {
              // Check if table exists and has audio comments
              const { data, error } = await supabase
                .from(safeTableCast(tableName))
                .select('id, numero, artigo, comentario_audio')
                .not('comentario_audio', 'is', null);
              
              if (error) {
                console.error(`Error querying table ${tableName}:`, error);
                return null;
              }
              
              // If we have articles with audio, process them
              if (data && data.length > 0) {
                // Convert to our format - Add proper type checking to avoid errors
                const articles = data.map(item => {
                  // Make sure the item is not an error and has the expected properties
                  if (item && typeof item === 'object' && 'id' in item && 'numero' in item && 'artigo' in item && 'comentario_audio' in item) {
                    return {
                      id: String(item.id),
                      numero: item.numero,
                      artigo: item.artigo,
                      comentario_audio: item.comentario_audio
                    };
                  }
                  return null;
                }).filter(Boolean) as LegalArticle[]; // Filter out any null values
                
                // Only add to codes list if we have valid articles
                if (articles.length > 0) {
                  // Determine category based on table name
                  const category = categorizeLegalCode(tableName);
                  
                  // Add to codes list
                  codesWithAudioData.push({
                    id: tableName,
                    title: getCodeTitle(tableName),
                    category,
                    icon: getCodeIcon(tableName),
                    audioCount: articles.length
                  });
                  
                  // Add to articles map
                  articlesMapData[tableName] = articles;
                }
              }
              
              return { tableName, hasAudio: data && data.length > 0 };
            } catch (err) {
              console.error(`Error processing table ${tableName}:`, err);
              return null;
            }
          });
          
          await Promise.all(batchPromises);
        }
        
        // Sort codes by category and then by title
        codesWithAudioData.sort((a, b) => {
          if (a.category !== b.category) {
            // Order categories: códigos, estatutos, constituição, leis
            const categoryOrder = {
              'códigos': 0,
              'estatutos': 1, 
              'constituição': 2,
              'leis': 3
            };
            return categoryOrder[a.category] - categoryOrder[b.category];
          }
          return a.title.localeCompare(b.title);
        });
        
        setCodesWithAudio(codesWithAudioData);
        setArticlesMap(articlesMapData);
        
        // If we have codes with audio, select the first one
        if (codesWithAudioData.length > 0 && !selectedCodeId) {
          setSelectedCodeId(codesWithAudioData[0].id);
        }
      } catch (err) {
        console.error('Error fetching audio comments:', err);
        toast.error('Erro ao carregar comentários em áudio');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudioComments();
  }, [selectedCodeId]);
  
  // Handle code selection
  const handleSelectCode = (codeId: string) => {
    setSelectedCodeId(codeId);
    setFocusedArticle(null);
  };
  
  // Set focused article for audio playback
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if audio is playing and get current article
      if (globalAudioState.currentAudioId && selectedCodeId && articlesMap[selectedCodeId]) {
        const playingArticle = articlesMap[selectedCodeId].find(
          article => article.id === globalAudioState.currentAudioId
        );
        
        if (playingArticle) {
          setFocusedArticle(playingArticle);
        }
      } else if (!globalAudioState.currentAudioId) {
        // No audio playing, clear focus
        setFocusedArticle(null);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [articlesMap, selectedCodeId]);
  
  // Clear focus when changing code
  useEffect(() => {
    setFocusedArticle(null);
  }, [selectedCodeId]);
  
  return (
    <div className="min-h-screen flex flex-col bg-netflix-bg animate-fade-in">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-2xl font-serif font-bold text-law-accent mb-6 flex items-center gap-2"
        >
          <Headphones className="h-6 w-6" />
          Comentários em Áudio
        </motion.h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400">Carregando comentários em áudio...</div>
          </div>
        ) : codesWithAudio.length === 0 ? (
          <div className="bg-netflix-dark/50 rounded-lg border border-gray-800 p-8 text-center">
            <Headphones className="h-16 w-16 mx-auto text-gray-500 mb-4 opacity-50" />
            <p className="text-gray-300 mb-4 text-lg">
              Não foram encontrados comentários em áudio.
            </p>
            <p className="text-gray-400">
              Os comentários em áudio estarão disponíveis em breve.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <AudioCategorySelector 
                codes={codesWithAudio}
                onSelectCode={handleSelectCode}
                currentCodeId={selectedCodeId}
              />
            </div>
            
            <div className="md:col-span-2">
              {focusedArticle ? (
                <AudioFocusMode 
                  article={focusedArticle}
                  codeTitle={getCodeTitle(selectedCodeId || '')}
                  onBack={() => setFocusedArticle(null)}
                />
              ) : (
                <div>
                  {selectedCodeId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-netflix-dark/50 rounded-lg border border-gray-800 p-6"
                    >
                      <h3 className="text-xl font-serif font-semibold text-law-accent mb-4 flex items-center gap-2">
                        {getCodeIcon(selectedCodeId)}
                        {getCodeTitle(selectedCodeId)}
                        <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                          {articlesMap[selectedCodeId]?.length || 0} comentários
                        </span>
                      </h3>
                      
                      <AudioCommentPlaylist
                        articlesMap={{ [selectedCodeId]: articlesMap[selectedCodeId] || [] }}
                      />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default AudioComments;
