
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StudyCard } from '@/components/study/StudyCard';
import { StudyProgress } from '@/components/study/StudyProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyStore } from '@/store/studyStore';
import { BookOpen, Play, Pause, RotateCcw, Plus, Target, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFavoritesStore } from '@/store/favoritesStore';
import { legalCodes } from '@/data/legalCodes';

const StudyMode = () => {
  const { 
    cards, 
    getCardsForReview, 
    isStudyMode, 
    currentCard,
    setCurrentCard,
    startStudySession,
    endStudySession,
    addCard,
    createGoal
  } = useStudyStore();
  
  const { favorites } = useFavoritesStore();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studiedToday, setStudiedToday] = useState(0);

  const cardsForReview = getCardsForReview();
  const [sessionCards, setSessionCards] = useState<typeof cardsForReview>([]);

  useEffect(() => {
    if (cardsForReview.length > 0) {
      setSessionCards([...cardsForReview]);
    }
  }, [cardsForReview]);

  // Auto-create cards from favorites if user has no study cards
  useEffect(() => {
    if (cards.length === 0 && favorites.length > 0) {
      favorites.forEach(fav => {
        const code = legalCodes.find(c => c.id === fav.codeId);
        const article = code?.articles.find(a => a.id === fav.articleId);
        
        if (article && code) {
          addCard(article.id, code.id, article.number, article.content);
        }
      });
    }
  }, [cards.length, favorites, addCard]);

  const startSession = () => {
    if (sessionCards.length === 0) {
      setSessionCards([...cardsForReview]);
    }
    setCurrentCardIndex(0);
    setCurrentCard(sessionCards[0] || null);
    setSessionStartTime(new Date());
    startStudySession();
  };

  const endSession = () => {
    if (sessionStartTime) {
      const timeSpent = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60);
      endStudySession(timeSpent);
    }
    setSessionStartTime(null);
    setCurrentCard(null);
    setCurrentCardIndex(0);
  };

  const nextCard = () => {
    setStudiedToday(prev => prev + 1);
    
    if (currentCardIndex < sessionCards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setCurrentCard(sessionCards[nextIndex]);
    } else {
      // Session completed
      endSession();
    }
  };

  const createDailyGoal = () => {
    createGoal('daily', 10); // Default to 10 cards per day
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col dark bg-netflix-bg">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-2xl mx-auto bg-netflix-dark border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-law-accent text-2xl font-serif mb-4">
                <Brain className="h-8 w-8 mx-auto mb-2" />
                Bem-vindo ao Modo Estudo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-300">
                Para começar a estudar, você precisa adicionar artigos aos seus favoritos. 
                O sistema criará automaticamente cards de estudo baseados nos seus artigos favoritos.
              </p>
              
              <div className="space-y-4">
                <Link to="/favoritos">
                  <Button className="w-full bg-law-accent hover:bg-law-accent/80">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver meus favoritos
                  </Button>
                </Link>
                
                <Link to="/codigos">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Explorar códigos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-law-accent mb-2 text-center">
            Modo Estudo
          </h1>
          <p className="text-gray-400 text-center">
            Sistema de repetição espaçada para aprendizado eficiente
          </p>
        </motion.div>

        <Tabs defaultValue="study" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-netflix-dark">
            <TabsTrigger value="study" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Estudar
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Progresso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study">
            {!isStudyMode ? (
              <Card className="max-w-2xl mx-auto bg-netflix-dark border-gray-800">
                <CardHeader>
                  <CardTitle className="text-center text-law-accent">
                    Sessão de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-netflix-bg rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-law-accent">{cardsForReview.length}</div>
                      <div className="text-sm text-gray-400">Para revisar hoje</div>
                    </div>
                    <div className="p-4 bg-netflix-bg rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-law-accent">{cards.length}</div>
                      <div className="text-sm text-gray-400">Total de cards</div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <Button 
                      onClick={startSession}
                      disabled={cardsForReview.length === 0}
                      className="w-full bg-law-accent hover:bg-law-accent/80 text-white font-medium py-3 text-lg"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {cardsForReview.length > 0 ? 'Iniciar Sessão' : 'Nenhum card para revisar'}
                    </Button>

                    {cardsForReview.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        Volte amanhã ou adicione mais artigos aos favoritos
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Session Header */}
                <Card className="bg-netflix-dark border-gray-800">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-law-accent/20 text-law-accent">
                          {currentCardIndex + 1} de {sessionCards.length}
                        </Badge>
                        <Badge variant="outline">
                          Estudados hoje: {studiedToday}
                        </Badge>
                      </div>
                      <Button 
                        onClick={endSession}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-500 hover:bg-red-500/10"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Study Card */}
                <AnimatePresence mode="wait">
                  {currentCard && (
                    <StudyCard 
                      key={currentCard.id}
                      card={currentCard} 
                      onNext={nextCard}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              <StudyProgress />
              
              <Card className="bg-netflix-dark border-gray-800">
                <CardHeader>
                  <CardTitle className="text-law-accent">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={createDailyGoal}
                      variant="outline"
                      className="justify-start"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Criar meta diária
                    </Button>
                    
                    <Link to="/favoritos">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar mais cards
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudyMode;
