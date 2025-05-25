
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Search, Trophy } from "lucide-react";
import { useEngagement } from "@/hooks/useEngagement";
import { motion } from "framer-motion";

export const EngagementIndicator = () => {
  const { metrics, formatSessionTime } = useEngagement();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 items-center text-xs"
    >
      <Badge variant="secondary" className="flex items-center gap-1 bg-law-accent/10 text-law-accent">
        <Clock className="h-3 w-3" />
        {formatSessionTime()}
      </Badge>
      
      {metrics.articlesRead > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-500">
          <BookOpen className="h-3 w-3" />
          {metrics.articlesRead}
        </Badge>
      )}
      
      {metrics.searchesPerformed > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-500">
          <Search className="h-3 w-3" />
          {metrics.searchesPerformed}
        </Badge>
      )}
      
      {metrics.streakDays > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500">
          <Trophy className="h-3 w-3" />
          {metrics.streakDays}
        </Badge>
      )}
    </motion.div>
  );
};
