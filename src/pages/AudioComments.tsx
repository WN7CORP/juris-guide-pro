
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Headphones, Search, Filter, Clock, BookOpen, Play, Pause, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { getArticlesWithAudioComments } from '@/services/legalCodeService';
import { tableNameMap } from '@/utils/tableMapping';
import { legalCodes } from '@/data/legalCodes';
import { globalAudioState } from '@/components/AudioCommentPlaylist';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudioComment {
  codeId: string;
  codeTitle: string;
  article: {
    id: string;
    numero: string;
    artigo: string;
    comentario_audio: string;
  };
}

const AudioComments = () => {
  const [audioComments, setAudioComments] = useState<AudioComment[]>([]);
  const [filteredComments, setFilteredComments] = useState<AudioComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [currentPlayingId, setCurrentPlayingId] = useState<string>('');

  const loadAudioComments = async () => {
    setLoading(true);
    try {
      const tableNames = Object.values(tableNameMap).filter(Boolean) as string[];
      const results = await getArticlesWithAudioComments(tableNames);

      const audioArticles: AudioComment[] = [];
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
                article: {
                  id: String(article.id || ''),
                  numero: String(article.numero || ''),
                  artigo: String(article.artigo || ''),
                  comentario_audio: String(article.comentario_audio || '')
                }
              });
            }
          });
        }
      });

      setAudioComments(audioArticles);
      setFilteredComments(audioArticles);
    } catch (error) {
      console.error('Failed to load audio comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudioComments();
  }, []);

  // Check current playing audio state
  useEffect(() => {
    const checkCurrentAudio = () => {
      setCurrentPlayingId(globalAudioState.currentAudioId || '');
    };

    checkCurrentAudio();
    const interval = setInterval(checkCurrentAudio, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = audioComments;

    // Filter by code
    if (selectedCode !== 'all') {
      filtered = filtered.filter(comment => comment.codeId === selectedCode);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(comment =>
        comment.article.artigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.article.numero.includes(searchTerm) ||
        comment.codeTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => parseInt(b.article.id) - parseInt(a.article.id));
    } else if (sortBy === 'article-number') {
      filtered.sort((a, b) => parseInt(a.article.numero) - parseInt(b.article.numero));
    }

    setFilteredComments(filtered);
  }, [audioComments, searchTerm, selectedCode, sortBy]);

  const handlePlayAudio = (comment: AudioComment) => {
    const articleId = comment.article.id;
    const isCurrentlyPlaying = currentPlayingId === articleId && globalAudioState.isPlaying;

    if (isCurrentlyPlaying) {
      // Pause current audio
      if (globalAudioState.audioElement) {
        globalAudioState.audioElement.pause();
        globalAudioState.isPlaying = false;
      }
    } else {
      // Stop any currently playing audio
      globalAudioState.stopCurrentAudio();
      
      // Create and play new audio
      const audio = new Audio(comment.article.comentario_audio);
      audio.play();
      
      // Update global state
      globalAudioState.audioElement = audio;
      globalAudioState.currentAudioId = articleId;
      globalAudioState.isPlaying = true;
      globalAudioState.minimalPlayerInfo = {
        articleId,
        articleNumber: comment.article.numero,
        codeId: comment.codeId,
        audioUrl: comment.article.comentario_audio
      };

      // Set up event listeners
      audio.addEventListener('ended', () => {
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
        setCurrentPlayingId('');
      });

      audio.addEventListener('pause', () => {
        globalAudioState.isPlaying = false;
      });

      audio.addEventListener('play', () => {
        globalAudioState.isPlaying = true;
        setCurrentPlayingId(articleId);
      });
    }
  };

  const handleDownloadAudio = (audioUrl: string, articleNumber: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `comentario_art_${articleNumber}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueCodes = () => {
    const codes = Array.from(new Set(audioComments.map(comment => comment.codeId)));
    return codes.map(codeId => ({
      id: codeId,
      title: legalCodes.find(code => code.id === codeId)?.title || codeId
    }));
  };

  const totalDuration = audioComments.length * 3; // Estimativa de 3 min por comentário

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col dark bg-netflix-bg">
        <Header />
        
        <main className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-sky-600/20 border border-cyan-500/30">
                  <Headphones className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-netflix-red">
                    Comentários em Áudio
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base">
                    {filteredComments.length} artigos comentados disponíveis
                  </p>
                </div>
              </div>
              
              <Button
                onClick={loadAudioComments}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-netflix-dark border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {audioComments.length}
                  </div>
                  <div className="text-xs text-gray-400">Total de Comentários</div>
                </CardContent>
              </Card>
              
              <Card className="bg-netflix-dark border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {getUniqueCodes().length}
                  </div>
                  <div className="text-xs text-gray-400">Códigos com Áudio</div>
                </CardContent>
              </Card>
              
              <Card className="bg-netflix-dark border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    ~{Math.floor(totalDuration / 60)}h
                  </div>
                  <div className="text-xs text-gray-400">Tempo Total</div>
                </CardContent>
              </Card>
              
              <Card className="bg-netflix-dark border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {filteredComments.length}
                  </div>
                  <div className="text-xs text-gray-400">Resultados</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-netflix-dark border-gray-800">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por artigo ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Code Filter */}
                  <Select value={selectedCode} onValueChange={setSelectedCode}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Filtrar por código" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">Todos os códigos</SelectItem>
                      {getUniqueCodes().map(code => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="article-number">Número do artigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Audio Comments List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando comentários...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm || selectedCode !== 'all' 
                    ? 'Nenhum comentário encontrado com os filtros aplicados.'
                    : 'Nenhum comentário em áudio disponível.'
                  }
                </p>
              </div>
            ) : (
              filteredComments.map((comment, index) => {
                const isCurrentlyPlaying = currentPlayingId === comment.article.id && globalAudioState.isPlaying;
                
                return (
                  <motion.div
                    key={`${comment.codeId}-${comment.article.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * Math.min(index, 5) }}
                  >
                    <Card className="bg-netflix-dark border-gray-800 hover:border-gray-700 transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Play Button */}
                          <div className="flex-shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={isCurrentlyPlaying ? "default" : "outline"}
                                  size="lg"
                                  onClick={() => handlePlayAudio(comment)}
                                  className={`h-12 w-12 rounded-full p-0 ${
                                    isCurrentlyPlaying 
                                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white animate-pulse' 
                                      : 'hover:bg-cyan-500/20 hover:border-cyan-500/50'
                                  }`}
                                >
                                  {isCurrentlyPlaying ? (
                                    <Pause className="h-5 w-5" />
                                  ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isCurrentlyPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-cyan-400 text-xl">
                                Art. {comment.article.numero}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {comment.codeTitle}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-300 leading-relaxed text-sm mb-4 line-clamp-3">
                              {comment.article.artigo}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>Comentário em áudio disponível</span>
                              </div>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadAudio(comment.article.comentario_audio, comment.article.numero)}
                                    className="text-gray-400 hover:text-white p-2 h-8 w-8"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Baixar áudio
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AudioComments;
