
import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Headphones, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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

interface AudioCarouselProps {
  audioComments: AudioComment[];
}

export const AudioCarousel: React.FC<AudioCarouselProps> = ({ audioComments }) => {
  if (!audioComments || audioComments.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-law-accent flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-law-accent/20 to-netflix-red/20 border border-law-accent/30">
            <PlayCircle className="h-6 w-6 text-law-accent" />
          </div>
          Últimos Comentários em Áudio
        </h2>
        
        <Link 
          to="/audio-comentarios" 
          className="flex items-center gap-2 text-law-accent hover:text-law-accent/80 transition-colors text-sm font-medium group"
        >
          Ver todos
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {audioComments.map((audioComment, index) => (
              <CarouselItem key={`${audioComment.codeId}-${audioComment.article.id}`} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="h-full"
                >
                  <Link 
                    to={`/codigos/${audioComment.codeId}?article=${audioComment.article.id}&highlight=true&autoplay=true`}
                    className="block h-full"
                  >
                    <Card className="h-full bg-gradient-to-br from-law-accent/10 via-netflix-red/5 to-transparent border border-law-accent/30 hover:border-law-accent/50 transition-all duration-300 shadow-lg hover:shadow-law-accent/20 backdrop-blur-sm min-h-[160px]">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-full bg-gradient-to-r from-law-accent/20 to-netflix-red/20 border border-law-accent/40 shadow-lg">
                            <Headphones className="h-4 w-4 text-law-accent" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-law-accent bg-law-accent/10 px-2 py-1 rounded-full border border-law-accent/20">
                                {audioComment.codeTitle}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <span className="text-sm font-medium text-netflix-red bg-netflix-red/10 px-2 py-1 rounded-md">
                                Art. {audioComment.article.numero}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 line-clamp-2 flex-grow leading-relaxed">
                          {audioComment.article.artigo}
                        </p>
                        
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-law-accent">
                              <PlayCircle className="h-3 w-3" />
                              <span className="font-medium">Comentário disponível</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>Clique para ouvir</span>
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="hidden md:flex -left-12 bg-netflix-dark/80 border-law-accent/30 text-law-accent hover:bg-law-accent/20 hover:border-law-accent/50" />
          <CarouselNext className="hidden md:flex -right-12 bg-netflix-dark/80 border-law-accent/30 text-law-accent hover:bg-law-accent/20 hover:border-law-accent/50" />
        </Carousel>
      </div>

      {/* Mobile scroll indicator */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Deslize para ver mais</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};

export default AudioCarousel;
