import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, Search, Filter, Headphones, Clock, Book, X, Play, Pause, Volume2, SkipBack, SkipForward, Type, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { getArticlesWithAudioComments } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { legalCodes } from "@/data/legalCodes";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useIsMobile } from "@/hooks/use-mobile";

interface AudioArticle {
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
  const [textSize, setTextSize] = useState(16);
  const [activeSection, setActiveSection] = useState<'text' | 'audio'>('text');
  const isMobile = useIsMobile();

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

  // Filter articles based on search and code selection
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
    setShowingArticle(article);
    if (isMobile) {
      setActiveSection('text'); // Start with text on mobile
    }
  };

  const adjustTextSize = (delta: number) => {
    setTextSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  const AudioPlayerCard = ({ article }: { article: AudioArticle }) => {
    const articleId = `${article.codeId}-${article.id}`;
    const { 
      isPlaying, 
      currentTime, 
      duration, 
      volume, 
      playbackSpeed,
      togglePlay, 
      seek, 
      setVolume: setAudioVolume,
      setPlaybackSpeed
    } = useAudioPlayer({
      articleId,
      articleNumber: article.numero,
      codeId: article.codeId,
      audioUrl: article.comentario_audio
    });

    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const [showSpeedControl, setShowSpeedControl] = useState(false);

    const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (value: number[]) => {
      seek(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
      setAudioVolume(value[0]);
    };

    const skipTime = (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seek(newTime);
    };

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    return (
      <div className="fixed inset-0 z-50 bg-netflix-bg">
        <div className="h-full flex flex-col">
          {/* Enhanced Header with controls */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-netflix-dark flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs px-2 py-1">
                {article.codeTitle}
              </Badge>
              <Badge variant="outline" className="text-netflix-red border-netflix-red/30 text-xs px-2 py-1">
                Art. {article.numero}
              </Badge>
            </div>
            
            {/* Text size controls */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustTextSize(-1)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-400 min-w-[2rem] text-center">{textSize}px</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustTextSize(1)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowingArticle(null)}
              className="text-gray-400 hover:text-white flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {isMobile ? (
            // Enhanced Mobile Layout with tab switching
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mobile Tab Switcher */}
              <div className="flex bg-netflix-dark border-b border-gray-700 flex-shrink-0">
                <Button
                  variant={activeSection === 'text' ? 'default' : 'ghost'}
                  onClick={() => setActiveSection('text')}
                  className={`flex-1 rounded-none border-b-2 ${
                    activeSection === 'text' 
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400' 
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Texto do Artigo
                </Button>
                <Button
                  variant={activeSection === 'audio' ? 'default' : 'ghost'}
                  onClick={() => setActiveSection('audio')}
                  className={`flex-1 rounded-none border-b-2 ${
                    activeSection === 'audio' 
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400' 
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  <Headphones className="h-4 w-4 mr-2" />
                  Comentário
                </Button>
              </div>

              {/* Content based on active section */}
              {activeSection === 'text' ? (
                // Enhanced Article Text Section
                <div className="flex-1 min-h-0 bg-netflix-dark">
                  {/* Progress indicator */}
                  <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Progresso: {formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Article Text */}
                  <ScrollArea className="flex-1 h-full">
                    <div className="p-4 pb-20">
                      <div 
                        className="text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-400/20"
                        style={{ 
                          fontSize: `${textSize}px`,
                          lineHeight: textSize <= 14 ? '1.6' : textSize <= 18 ? '1.7' : '1.8'
                        }}
                      >
                        {article.artigo}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                // Enhanced Audio Controls Section
                <div className="flex-1 bg-netflix-dark flex flex-col min-h-0">
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center space-y-6 w-full max-w-sm">
                      {/* Large Play Button */}
                      <div className="flex justify-center">
                        <Button
                          onClick={togglePlay}
                          size="lg"
                          className="h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="h-8 w-8" />
                          ) : (
                            <Play className="h-8 w-8 ml-1" />
                          )}
                        </Button>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">
                          {isPlaying ? 'Reproduzindo' : 'Pronto para ouvir'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {isPlaying ? 'Toque para pausar' : 'Toque para reproduzir o comentário'}
                        </p>
                      </div>

                      {/* Time Display */}
                      <div className="text-center">
                        <div className="text-2xl font-mono text-cyan-400 mb-1">
                          {formatTime(currentTime)}
                        </div>
                        <div className="text-sm text-gray-400">
                          de {formatTime(duration)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sticky Bottom Audio Controls - FIXED: Removed transparency */}
              <div className="bg-netflix-dark border-t border-gray-700 p-3 space-y-3 flex-shrink-0">
                {/* Progress Bar */}
                <div>
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(-10)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 h-10 w-10 p-0"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full h-12 w-12 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(10)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700 h-10 w-10 p-0"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-center gap-4">
                  {/* Speed Control */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSpeedControl(!showSpeedControl)}
                      className="text-gray-300 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 text-xs"
                    >
                      {playbackSpeed}x
                    </Button>
                    
                    {showSpeedControl && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                        <div className="flex flex-col gap-1 min-w-[60px]">
                          {speedOptions.map(speed => (
                            <Button
                              key={speed}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPlaybackSpeed(speed);
                                setShowSpeedControl(false);
                              }}
                              className={`text-xs justify-center hover:bg-gray-700 ${playbackSpeed === speed ? 'text-cyan-400' : 'text-gray-300'}`}
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVolumeControl(!showVolumeControl)}
                      className="text-gray-300 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 h-8 w-8 p-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    
                    {showVolumeControl && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                        <div className="w-20">
                          <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                          />
                          <div className="text-center text-xs text-gray-400 mt-1">
                            {Math.round(volume * 100)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Enhanced Desktop Layout - remains largely the same but with text size control
            <div className="h-full flex gap-4 p-4">
              {/* Article Text */}
              <div className="flex-1 bg-netflix-dark rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-3 border-b border-gray-700 bg-netflix-dark flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Book className="h-4 w-4 text-cyan-400" />
                    Texto do Artigo
                  </h3>
                  <div className="flex items-center gap-2">
                    <Type className="h-3 w-3 text-gray-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustTextSize(-1)}
                      className="text-gray-400 hover:text-white h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-gray-400 min-w-[2.5rem] text-center">{textSize}px</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustTextSize(1)}
                      className="text-gray-400 hover:text-white h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div 
                    className="text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-cyan-400/20"
                    style={{ 
                      fontSize: `${textSize}px`,
                      lineHeight: textSize <= 14 ? '1.6' : textSize <= 18 ? '1.7' : '1.8'
                    }}
                  >
                    {article.artigo}
                  </div>
                </div>
              </div>

              {/* Audio Player - existing desktop code with enhancements */}
              <div className="w-80 bg-netflix-dark rounded-lg border border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-700 bg-netflix-dark">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-cyan-400" />
                    Comentário em Áudio
                  </h3>
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-center">
                  {/* Progress and Time */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="w-full"
                    />
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(-10)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={togglePlay}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full h-12 w-12 p-0"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(10)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-white font-medium mb-1">
                      {isPlaying ? 'Reproduzindo' : 'Pronto'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isPlaying ? 'Reproduzindo comentário...' : 'Clique para ouvir'}
                    </p>
                  </div>

                  {/* Secondary Controls */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Speed Control */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSpeedControl(!showSpeedControl)}
                        className="text-gray-400 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 text-xs"
                      >
                        {playbackSpeed}x
                      </Button>
                      
                      {showSpeedControl && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                          <div className="flex flex-col gap-1 min-w-[60px]">
                            {speedOptions.map(speed => (
                              <Button
                                key={speed}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPlaybackSpeed(speed);
                                  setShowSpeedControl(false);
                                }}
                                className={`text-xs justify-center hover:bg-gray-700 ${playbackSpeed === speed ? 'text-cyan-400' : 'text-gray-400'}`}
                              >
                                {speed}x
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Volume Control */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVolumeControl(!showVolumeControl)}
                        className="text-gray-400 hover:text-white bg-netflix-dark border-gray-600 hover:bg-gray-700 h-8 w-8 p-0"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      
                      {showVolumeControl && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-netflix-dark border border-gray-700 rounded-md shadow-lg z-30">
                          <div className="w-20">
                            <Slider
                              value={[volume]}
                              max={1}
                              step={0.01}
                              onValueChange={handleVolumeChange}
                              className="w-full"
                            />
                            <div className="text-center text-xs text-gray-400 mt-1">
                              {Math.round(volume * 100)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40">
              <Headphones className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-netflix-red">
                Comentários em Áudio
              </h1>
              <p className="text-gray-400 mt-1">
                Ouça explicações detalhadas dos artigos mais importantes
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>{availableCodes.length} códigos</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span>{audioArticles.length} artigos com áudio</span>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-netflix-dark border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por artigo, número ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-netflix-bg border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="md:w-64">
                  <Select value={selectedCode} onValueChange={setSelectedCode}>
                    <SelectTrigger className="bg-netflix-bg border-gray-600 text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por código" />
                    </SelectTrigger>
                    <SelectContent className="bg-netflix-dark border-gray-600 z-50">
                      <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        Todos os códigos
                      </SelectItem>
                      {availableCodes.map(code => (
                        <SelectItem key={code.id} value={code.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          {code.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredArticles.map((article, index) => (
            <motion.div
              key={`${article.codeId}-${article.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full bg-gradient-to-br from-netflix-dark to-gray-900 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40">
                        <PlayCircle className="h-4 w-4 text-cyan-400" />
                      </div>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 bg-cyan-400/10">
                        Art. {article.numero}
                      </Badge>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* Code Title */}
                  <div className="mb-3">
                    <Badge className="text-xs bg-netflix-red/20 text-netflix-red border-netflix-red/30">
                      {article.codeTitle}
                    </Badge>
                  </div>

                  {/* Article Content */}
                  <p className="text-sm text-gray-300 line-clamp-4 flex-grow leading-relaxed mb-4">
                    {article.artigo}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-cyan-400">
                        <Headphones className="h-3 w-3" />
                        <span>Comentário disponível</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none"
                        onClick={() => handlePlayAudio(article)}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Ouvir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredArticles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="p-4 rounded-full bg-gray-800/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Headphones className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum comentário encontrado
            </h3>
            <p className="text-gray-400 text-sm">
              Tente ajustar os filtros ou termo de busca
            </p>
          </motion.div>
        )}

        {/* Audio Player Card */}
        {showingArticle && <AudioPlayerCard article={showingArticle} />}
      </main>
    </div>
  );
};

export default AudioComments;
