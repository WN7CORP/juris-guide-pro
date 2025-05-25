
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/store/studyStore';
import { Target, Clock, TrendingUp, Award, Calendar, BookOpen } from 'lucide-react';

export const StudyProgress = () => {
  const { stats, goals, getCardsForReview } = useStudyStore();
  const cardsForReview = getCardsForReview();
  const activeGoals = goals.filter(goal => new Date() <= goal.endDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Daily Progress */}
      <Card className="bg-netflix-dark border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-law-accent flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Progresso Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeGoals.filter(g => g.type === 'daily').map(goal => (
            <div key={goal.id} className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Meta do dia</span>
                <span className="text-law-accent">{goal.current}/{goal.target}</span>
              </div>
              <Progress 
                value={(goal.current / goal.target) * 100} 
                className="h-2"
              />
              <Badge 
                variant={goal.current >= goal.target ? "default" : "secondary"}
                className="w-full justify-center"
              >
                {goal.current >= goal.target ? '✅ Meta Atingida!' : `${goal.target - goal.current} restantes`}
              </Badge>
            </div>
          ))}
          
          {activeGoals.filter(g => g.type === 'daily').length === 0 && (
            <div className="text-center text-gray-400 py-4">
              <p>Nenhuma meta diária definida</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Stats */}
      <Card className="bg-netflix-dark border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-law-accent flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cards estudados
            </span>
            <Badge variant="outline">{stats.totalCardsStudied}</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo total
            </span>
            <Badge variant="outline">{Math.round(stats.totalTimeSpent)} min</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Precisão média
            </span>
            <Badge 
              variant="outline"
              className={stats.averageAccuracy > 80 ? 'border-green-500 text-green-400' : 
                        stats.averageAccuracy > 60 ? 'border-yellow-500 text-yellow-400' : 
                        'border-red-500 text-red-400'}
            >
              {stats.averageAccuracy.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Streak & Review */}
      <Card className="bg-netflix-dark border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-law-accent flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Sequência & Revisão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-law-accent mb-1">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-400">
              dias consecutivos
            </div>
            {stats.currentStreak > 0 && (
              <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500">
                🔥 Em chamas!
              </Badge>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Para revisar hoje</span>
              <Badge variant="outline" className="text-law-accent">
                {cardsForReview.length}
              </Badge>
            </div>
            {cardsForReview.length > 0 && (
              <Progress 
                value={100} 
                className="h-2 bg-law-accent/20"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
