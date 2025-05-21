import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import CodeHeader from "@/components/CodeHeader";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Volume, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import { useRecentViewStore } from "@/store/recentViewStore";

interface Article {
  number: string;
  title: string;
  content: string;
  audioUrl?: string;
}

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const location = useLocation();
  const [legalCode, setLegalCode] = useState<typeof legalCodes[0] | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const articleParam = new URLSearchParams(location.search).get('article');
  const { addRecentArticle } = useRecentViewStore();

  useEffect(() => {
    if (!codigoId) return;

    const code = legalCodes.find((c) => c.id === codigoId);
    setLegalCode(code || null);

    if (code && articleParam) {
      const foundArticle = code.articles.find(
        (a) => a.number === articleParam
      );
      setArticle(foundArticle || null);
    }
  }, [codigoId, articleParam]);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    // Check if the current code is in favorites
    if (legalCode) {
      setIsFavorite(favorites.includes(legalCode.id));
    }
  }, [legalCode, favorites]);

  useEffect(() => {
    // Save favorites to localStorage whenever it changes
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = () => {
    if (!legalCode) return;

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((id) => id !== legalCode.id);
      setFavorites(updatedFavorites);
      setIsFavorite(false);
      toast({
        title: "Removido dos favoritos.",
        description: "O código foi removido da sua lista de favoritos.",
      });
    } else {
      // Add to favorites
      setFavorites([...favorites, legalCode.id]);
      setIsFavorite(true);
      toast({
        title: "Adicionado aos favoritos.",
        description: "O código foi adicionado à sua lista de favoritos.",
      });
    }
  };

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    error,
    togglePlay,
    seek,
    setVolume,
  } = useAudioPlayer({
    articleId: article?.number || '',
    articleNumber: article?.number,
    codeId: codigoId,
    audioUrl: article?.audioUrl || '',
  });

  useEffect(() => {
    // This will run after the article state is updated
    if (article) {
      addRecentArticle({
        id: articleParam || '',
        codeId: codigoId || '',
        codeTitle: legalCode?.title || '',
        articleNumber: article.number,
        content: article.content
      });
    }
  }, [article, codigoId, legalCode, articleParam, addRecentArticle]);

  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen flex flex-col dark">
      <div className="sticky top-0 z-10 bg-netflix-bg border-b border-gray-800">
        <div className="container mx-auto p-4">
          <CodeHeader title={legalCode?.title || "Código"} description={legalCode?.description} />
          <div className="flex justify-between items-center mb-4">
            <Button onClick={toggleFavorite} variant="outline">
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              <BookmarkIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto flex flex-col md:flex-row gap-4 p-4">
        {/* Article List */}
        <div className="w-full md:w-1/4 bg-netflix-dark border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Artigos</h2>
          </div>
          <Separator />
          <ScrollArea className="rounded-md h-[70vh]">
            {legalCode?.articles.map((article) => (
              <Link
                key={article.number}
                to={`/codigos/${codigoId}?article=${article.number}`}
                className={`block p-4 hover:bg-gray-900 transition-colors duration-200 ${articleParam === article.number ? "bg-gray-900" : ""
                  }`}
              >
                {article.number}. {article.title}
              </Link>
            ))}
          </ScrollArea>
        </div>

        {/* Article Content */}
        <div className="w-full md:w-3/4 bg-netflix-dark border border-gray-800 rounded-lg p-4">
          {article ? (
            <div>
              <h2 className="text-2xl font-semibold text-law-accent mb-2">
                {article.number}. {article.title}
              </h2>
              {article.audioUrl && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white" onClick={togglePlay}>
                      {isPlaying ? (
                        <Volume className="h-4 w-4" />
                      ) : (
                        <Volume className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <div className="text-xs text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  <audio src={article.audioUrl} preload="metadata" />
                </div>
              )}
              <p className="text-gray-400">{article.content}</p>
            </div>
          ) : (
            <p className="text-gray-500">Selecione um artigo para visualizar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodigoView;
