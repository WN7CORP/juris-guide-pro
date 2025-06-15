
import { motion } from "framer-motion";
import { Headphones, Book, PlayCircle } from "lucide-react";

interface AudioCommentsHeaderProps {
  totalCodes: number;
  totalArticles: number;
}

const AudioCommentsHeader = ({ totalCodes, totalArticles }: AudioCommentsHeaderProps) => {
  return (
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
          <span>{totalCodes} códigos</span>
        </div>
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4" />
          <span>{totalArticles} artigos com áudio</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioCommentsHeader;
