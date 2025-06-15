
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Headphones, PlayCircle, Book } from "lucide-react";
import { getArticlesWithAudioComments } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { legalCodes } from "@/data/legalCodes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAudioPlayerStore } from "@/store/audioPlayerStore";

// Import new components
import AudioCommentsHeader from "@/components/audio-comments/AudioCommentsHeader";
import AudioCommentsFilters from "@/components/audio-comments/AudioCommentsFilters";
import AudioArticlesList from "@/components/audio-comments/AudioArticlesList";
import AudioPlayerModal from "@/components/audio-comments/AudioPlayerModal";

export interface AudioArticle {
  id: string;
  numero: string;
  artigo: string;
  comentario_audio: string;
  codeId: string;
  codeTitle: string;
}

const AudioComments = () => {
  const [audioArticles, setAudioArticles] = useState<AudioArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("all");
  const [filteredArticles, setFilteredArticles] = useState<AudioArticle[]>([]);
  const [showingArticle, setShowingArticle] = useState<AudioArticle | null>(null);
  const isMobile = useIsMobile();
  
  // Audio store
  const { stopCurrentAudio } = useAudioPlayerStore();

  // Load audio articles
  useEffect(() => {
    const loadAudioArticles = async () => {
      try {
        setLoading(true);
        const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
        const results = await getArticlesWithAudioComments(tableNames);

        const articles: AudioArticle[] = [];
        results.forEach(result => {
          const codeInfo = Object.entries(tableNameMap)
            .find(([id, name]) => name === result.codeId);
          
          if (codeInfo) {
            const [codeId] = codeInfo;
            const codeTitle = legalCodes.find(code => code.id === codeId)?.title || codeId;
            
            result.articles.forEach(article => {
              if (article.comentario_audio) {
                articles.push({
                  id: String(article.id),
                  numero: article.numero,
                  artigo: article.artigo,
                  comentario_audio: article.comentario_audio,
                  codeId,
                  codeTitle
                });
              }
            });
          }
        });

        setAudioArticles(articles);
      } catch (error) {
        console.error('Failed to load audio articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAudioArticles();
  }, []);

  // Filter articles
  useEffect(() => {
    let filtered = audioArticles;

    if (searchTerm.trim()) {
      filtered = filtered.filter(article =>
        article.artigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.numero.includes(searchTerm) ||
        article.codeTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCode !== "all") {
      filtered = filtered.filter(article => article.codeId === selectedCode);
    }

    setFilteredArticles(filtered);
  }, [audioArticles, searchTerm, selectedCode]);

  // Get unique codes for filter
  const availableCodes = Array.from(new Set(audioArticles.map(article => article.codeId)))
    .map(codeId => ({
      id: codeId,
      title: legalCodes.find(code => code.id === codeId)?.title || codeId
    }));

  const handlePlayAudio = (article: AudioArticle) => {
    // Stop any currently playing audio
    stopCurrentAudio();
    setShowingArticle(article);
  };

  const handleClosePlayer = () => {
    setShowingArticle(null);
    stopCurrentAudio();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col dark bg-netflix-bg">
        <Header />
        <main className="flex-1 container pt-4 pb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando comentários em áudio...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container pt-4 pb-6 animate-fade-in">
        {/* Header Section */}
        <AudioCommentsHeader 
          totalCodes={availableCodes.length}
          totalArticles={audioArticles.length}
        />

        {/* Filters Section */}
        <AudioCommentsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCode={selectedCode}
          setSelectedCode={setSelectedCode}
          availableCodes={availableCodes}
        />

        {/* Articles List */}
        <AudioArticlesList
          articles={filteredArticles}
          onPlayAudio={handlePlayAudio}
        />

        {/* Audio Player Modal */}
        {showingArticle && (
          <AudioPlayerModal
            article={showingArticle}
            onClose={handleClosePlayer}
          />
        )}
      </main>
    </div>
  );
};

export default AudioComments;
