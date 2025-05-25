
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StudyProgressProps {
  articlesRead: number;
  totalArticles: number;
  studyTime: string;
  weeklyGoal: number;
  currentStreak: number;
}

export const StudyProgress = ({
  articlesRead,
  totalArticles,
  studyTime,
  weeklyGoal,
  currentStreak
}: StudyProgressProps) => {
  const progressPercentage = (articlesRead / totalArticles) * 100;
  const weeklyProgress = (articlesRead / weeklyGoal) * 100;

  return (
    <Card className="bg-netflix-dark border border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-law-accent" />
          Progresso de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Goal */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Meta Semanal</span>
            <Badge variant="secondary" className="bg-law-accent/10 text-law-accent">
              {articlesRead}/{weeklyGoal}
            </Badge>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-lg font-semibold text-white">{articlesRead}</div>
            <div className="text-xs text-gray-400">Artigos</div>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-lg font-semibold text-white">{studyTime}</div>
            <div className="text-xs text-gray-400">Tempo</div>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-lg font-semibold text-white">{currentStreak}</div>
            <div className="text-xs text-gray-400">Sequência</div>
          </motion.div>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progresso Total</span>
            <span className="text-sm text-gray-400">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
