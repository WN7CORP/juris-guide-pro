
import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Headphones, ChevronRight, Sparkles, Crown } from 'lucide-react';
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

interface NewsCarouselProps {
  audioComments: AudioComment[];
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ audioComments }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* Slide de Boas-vindas - Menor */}
            <CarouselItem className="pl-2 md:pl-4 basis-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="h-full"
              >
                <Card className="h-full bg-gradient-to-br from-law-accent/20 via-netflix-red/15 to-amber-500/10 border border-law-accent/40 shadow-2xl backdrop-blur-sm">
                  <CardContent className="p-6 h-full flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-netflix-red text-shadow-sm">
                          Vade Mecum Pro 2025
                        </h1>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                          <Crown className="h-5 w-5 text-law-accent" />
                        </div>
                      </div>
                      
                      <p className="text-gray-200 text-base mb-4 leading-relaxed">
                        Seu guia jurídico completo com todos os códigos, estatutos e leis principais do Brasil. 
                        Agora com comentários em áudio e ferramentas avançadas de estudo.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-amber-400">
                          <PlayCircle className="h-4 w-4" />
                          <span>Comentários em Áudio</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                          <Sparkles className="h-4 w-4" />
                          <span>Anotações Personais</span>
                        </div>
                      </div>
                      
                      <Link 
                        to="/codigos" 
                        className="flex items-center gap-2 text-law-accent hover:text-law-accent/80 transition-colors font-medium group"
                      >
                        Explorar
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>

            {/* Slides de Comentários em Áudio - Menores */}
            {audioComments.map((audioComment, index) => (
              <CarouselItem key={`${audioComment.codeId}-${audioComment.article.id}`} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  whileHover={{ scale: 1.02 }}
                  className="h-full"
                >
                  <Link 
                    to={`/codigos/${audioComment.codeId}?article=${audioComment.article.id}&highlight=true&autoplay=true`}
                    className="block h-full"
                  >
                    <Card className="h-full bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm min-h-[160px]">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 shadow-lg flex-shrink-0">
                            <Headphones className="h-4 w-4 text-cyan-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/20">
                                {audioComment.codeTitle}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <span className="text-sm font-medium text-teal-400 bg-teal-400/10 px-2 py-1 rounded-md">
                                Art. {audioComment.article.numero}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 line-clamp-2 flex-grow leading-relaxed mb-3">
                          {audioComment.article.artigo}
                        </p>
                        
                        <div className="mt-auto pt-3 border-t border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-cyan-400">
                              <PlayCircle className="h-3 w-3" />
                              <span className="font-medium">Novo comentário</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>Ouvir agora</span>
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
          <span>Deslize para ver mais novidades</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCarousel;
