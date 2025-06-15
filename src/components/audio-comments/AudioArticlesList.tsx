
import { motion } from "framer-motion";
import { PlayCircle, Clock, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioArticle } from "@/pages/AudioComments";

interface AudioArticlesListProps {
  articles: AudioArticle[];
  onPlayAudio: (article: AudioArticle) => void;
}

const AudioArticlesList = ({ articles, onPlayAudio }: AudioArticlesListProps) => {
  if (articles.length === 0) {
    return (
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {articles.map((article, index) => (
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
                    onClick={() => onPlayAudio(article)}
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
  );
};

export default AudioArticlesList;
