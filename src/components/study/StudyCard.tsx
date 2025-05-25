
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { StudyCard as StudyCardType, useStudyStore } from '@/store/studyStore';
import { motion } from 'framer-motion';

interface StudyCardProps {
  card: StudyCardType;
  onNext: () => void;
}

export const StudyCard = ({ card, onNext }: StudyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const { reviewCard, updateCardDifficulty } = useStudyStore();

  const handleAnswer = (correct: boolean) => {
    reviewCard(card.id, correct);
    setIsFlipped(false);
    setShowAnswer(false);
    onNext();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const accuracy = card.totalAnswers > 0 ? (card.correctAnswers / card.totalAnswers * 100).toFixed(1) : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-netflix-dark border-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-center mb-2">
            <Badge className={getDifficultyColor(card.difficulty)}>
              {card.difficulty === 'easy' ? 'Fácil' : card.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </Badge>
            <Badge variant="outline" className="text-gray-400">
              Precisão: {accuracy}%
            </Badge>
          </div>
          <CardTitle className="text-law-accent text-xl font-serif">
            {card.articleNumber}
          </CardTitle>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span>Revisões: {card.timesReviewed}</span>
            <span>Sequência: {card.streak}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div 
            className="min-h-[200px] p-6 bg-netflix-bg rounded-lg border border-gray-700 cursor-pointer transition-all duration-300 hover:border-law-accent/50"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center text-gray-300 text-lg leading-relaxed">
              {!isFlipped ? (
                <div>
                  <p className="mb-4 font-serif">{card.content}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                    <Eye className="h-4 w-4" />
                    <span>Clique para mostrar a explicação</span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-law-accent font-medium">Explicação e Exemplo Prático:</p>
                  <div className="text-left space-y-3">
                    <p className="text-gray-300">
                      Este artigo estabelece princípios fundamentais que devem ser estudados e compreendidos 
                      para a correta aplicação da lei.
                    </p>
                    <p className="text-gray-400 italic">
                      Exemplo prático: Na aplicação deste artigo, é importante considerar...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                    <EyeOff className="h-4 w-4" />
                    <span>Clique para ocultar</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isFlipped && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-gray-300 mb-4">Como você avalia sua compreensão deste artigo?</p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    className="flex items-center gap-2 border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4" />
                    Preciso revisar
                  </Button>
                  
                  <Button
                    onClick={() => handleAnswer(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Entendi bem
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateCardDifficulty(card.id, 'easy')}
                  className={card.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'}
                >
                  Fácil
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateCardDifficulty(card.id, 'medium')}
                  className={card.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400'}
                >
                  Médio
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateCardDifficulty(card.id, 'hard')}
                  className={card.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}
                >
                  Difícil
                </Button>
              </div>
            </motion.div>
          )}

          {!isFlipped && (
            <div className="flex justify-center">
              <Button
                onClick={() => setIsFlipped(true)}
                variant="outline"
                className="flex items-center gap-2 border-law-accent text-law-accent hover:bg-law-accent/10"
              >
                <RotateCcw className="h-4 w-4" />
                Mostrar explicação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
