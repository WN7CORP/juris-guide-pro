
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudyCard {
  id: string;
  articleId: string;
  codeId: string;
  articleNumber: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date;
  nextReview: Date;
  timesReviewed: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
}

export interface StudySession {
  id: string;
  date: Date;
  cardsStudied: number;
  timeSpent: number; // in minutes
  correctAnswers: number;
  totalAnswers: number;
}

export interface StudyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // cards to study
  current: number;
  startDate: Date;
  endDate: Date;
}

export interface StudyStats {
  totalCardsStudied: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  studyDays: number;
}

interface StudyState {
  cards: StudyCard[];
  sessions: StudySession[];
  goals: StudyGoal[];
  stats: StudyStats;
  isStudyMode: boolean;
  currentCard: StudyCard | null;
  
  // Actions
  addCard: (articleId: string, codeId: string, articleNumber: string, content: string) => void;
  updateCardDifficulty: (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  reviewCard: (cardId: string, correct: boolean) => void;
  getCardsForReview: () => StudyCard[];
  startStudySession: () => void;
  endStudySession: (timeSpent: number) => void;
  setCurrentCard: (card: StudyCard | null) => void;
  createGoal: (type: 'daily' | 'weekly' | 'monthly', target: number) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  calculateStats: () => void;
}

const calculateNextReview = (difficulty: 'easy' | 'medium' | 'hard', timesReviewed: number): Date => {
  const now = new Date();
  let daysToAdd = 1;
  
  switch (difficulty) {
    case 'easy':
      daysToAdd = Math.min(30, Math.pow(2, timesReviewed + 2));
      break;
    case 'medium':
      daysToAdd = Math.min(14, Math.pow(2, timesReviewed + 1));
      break;
    case 'hard':
      daysToAdd = Math.min(7, Math.pow(2, timesReviewed));
      break;
  }
  
  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + daysToAdd);
  return nextReview;
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      cards: [],
      sessions: [],
      goals: [],
      stats: {
        totalCardsStudied: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageAccuracy: 0,
        studyDays: 0,
      },
      isStudyMode: false,
      currentCard: null,

      addCard: (articleId, codeId, articleNumber, content) => {
        const newCard: StudyCard = {
          id: `${codeId}-${articleId}-${Date.now()}`,
          articleId,
          codeId,
          articleNumber,
          content: content.substring(0, 500), // Limit content length
          difficulty: 'medium',
          lastReviewed: new Date(),
          nextReview: calculateNextReview('medium', 0),
          timesReviewed: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          streak: 0,
        };
        
        set((state) => ({
          cards: [...state.cards.filter(c => c.articleId !== articleId), newCard]
        }));
      },

      updateCardDifficulty: (cardId, difficulty) => {
        set((state) => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  difficulty,
                  nextReview: calculateNextReview(difficulty, card.timesReviewed)
                }
              : card
          )
        }));
      },

      reviewCard: (cardId, correct) => {
        set((state) => {
          const cards = state.cards.map(card => {
            if (card.id === cardId) {
              const newTimesReviewed = card.timesReviewed + 1;
              const newCorrectAnswers = card.correctAnswers + (correct ? 1 : 0);
              const newTotalAnswers = card.totalAnswers + 1;
              const newStreak = correct ? card.streak + 1 : 0;
              
              // Adjust difficulty based on performance
              let newDifficulty = card.difficulty;
              const accuracy = newCorrectAnswers / newTotalAnswers;
              
              if (accuracy > 0.8 && newTimesReviewed > 3) {
                newDifficulty = 'easy';
              } else if (accuracy < 0.5) {
                newDifficulty = 'hard';
              }
              
              return {
                ...card,
                lastReviewed: new Date(),
                nextReview: calculateNextReview(newDifficulty, newTimesReviewed),
                timesReviewed: newTimesReviewed,
                correctAnswers: newCorrectAnswers,
                totalAnswers: newTotalAnswers,
                streak: newStreak,
                difficulty: newDifficulty,
              };
            }
            return card;
          });
          
          return { cards };
        });
        
        get().calculateStats();
      },

      getCardsForReview: () => {
        const now = new Date();
        return get().cards
          .filter(card => card.nextReview <= now)
          .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
      },

      startStudySession: () => {
        set({ isStudyMode: true });
      },

      endStudySession: (timeSpent) => {
        const session: StudySession = {
          id: Date.now().toString(),
          date: new Date(),
          cardsStudied: 0, // Will be calculated
          timeSpent,
          correctAnswers: 0, // Will be calculated
          totalAnswers: 0, // Will be calculated
        };
        
        set((state) => ({
          sessions: [...state.sessions, session],
          isStudyMode: false,
          currentCard: null,
        }));
        
        get().calculateStats();
      },

      setCurrentCard: (card) => {
        set({ currentCard: card });
      },

      createGoal: (type, target) => {
        const now = new Date();
        const endDate = new Date(now);
        
        switch (type) {
          case 'daily':
            endDate.setDate(now.getDate() + 1);
            break;
          case 'weekly':
            endDate.setDate(now.getDate() + 7);
            break;
          case 'monthly':
            endDate.setMonth(now.getMonth() + 1);
            break;
        }
        
        const goal: StudyGoal = {
          id: Date.now().toString(),
          type,
          target,
          current: 0,
          startDate: now,
          endDate,
        };
        
        set((state) => ({
          goals: [...state.goals, goal]
        }));
      },

      updateGoalProgress: (goalId, progress) => {
        set((state) => ({
          goals: state.goals.map(goal =>
            goal.id === goalId ? { ...goal, current: progress } : goal
          )
        }));
      },

      calculateStats: () => {
        const state = get();
        const totalCards = state.cards.length;
        const totalSessions = state.sessions.length;
        const totalTimeSpent = state.sessions.reduce((sum, session) => sum + session.timeSpent, 0);
        const totalCorrect = state.cards.reduce((sum, card) => sum + card.correctAnswers, 0);
        const totalAnswers = state.cards.reduce((sum, card) => sum + card.totalAnswers, 0);
        const averageAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
        
        // Calculate current streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentStreak = 0;
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          
          const hasStudiedOnDate = state.sessions.some(session => {
            const sessionDate = new Date(session.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === checkDate.getTime();
          });
          
          if (hasStudiedOnDate) {
            currentStreak++;
          } else if (i > 0) {
            break;
          }
        }
        
        set((state) => ({
          stats: {
            totalCardsStudied: totalCards,
            totalTimeSpent,
            currentStreak,
            longestStreak: Math.max(state.stats.longestStreak, currentStreak),
            averageAccuracy,
            studyDays: totalSessions,
          }
        }));
      },
    }),
    {
      name: 'study-storage',
    }
  )
);
