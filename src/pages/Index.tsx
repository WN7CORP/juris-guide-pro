
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { RecommendationCard } from "@/components/RecommendationCard";
import { StudyProgress } from "@/components/StudyProgress";
import { EngagementIndicator } from "@/components/EngagementIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { legalCodes } from "@/data/legalCodes";
import { Scale, BookOpen, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Index = () => {
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [studyStats, setStudyStats] = useState({
    articlesRead: 0,
    studyTime: "0h 0m",
    weeklyGoal: 50,
    currentStreak: 0
  });

  useEffect(() => {
    // Load recent codes from localStorage
    const stored = localStorage.getItem('recentCodes');
    if (stored) {
      setRecentCodes(JSON.parse(stored));
    }

    // Load study stats from localStorage
    const stats = localStorage.getItem('studyStats');
    if (stats) {
      setStudyStats(JSON.parse(stats));
    }
  }, []);

  const featuredCodes = legalCodes.slice(0, 6);
  const recommendations = [
    {
      title: "Direito Constitucional - Princípios Fundamentais",
      description: "Estude os princípios fundamentais da Constituição Federal",
      category: "Constituição",
      href: "/codigos/constituicao-federal",
      readTime: "15 min",
      popularity: 1247,
      isNew: false
    },
    {
      title: "Código Civil - Contratos",
      description: "Principais artigos sobre contratos no direito civil",
      category: "Civil",
      href: "/codigos/codigo-civil",
      readTime: "20 min",
      popularity: 892,
      isNew: true
    },
    {
      title: "Código Penal - Crimes contra a Pessoa",
      description: "Estudo detalhado dos crimes contra a pessoa",
      category: "Penal",
      href: "/codigos/codigo-penal",
      readTime: "25 min",
      popularity: 734,
      isNew: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6 px-4 space-y-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-serif font-bold text-white">
            Bem-vindo ao <span className="text-law-accent">JurisGuide</span>
          </h1>
          <p className="text-gray-400">
            Sua plataforma completa de estudos jurídicos
          </p>
          <EngagementIndicator />
        </motion.div>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-law-accent" />
            Ações Rápidas
          </h2>
          <QuickActions />
        </motion.section>

        {/* Study Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StudyProgress
            articlesRead={studyStats.articlesRead}
            totalArticles={1000}
            studyTime={studyStats.studyTime}
            weeklyGoal={studyStats.weeklyGoal}
            currentStreak={studyStats.currentStreak}
          />
        </motion.section>

        {/* Recent Codes */}
        {recentCodes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-law-accent" />
              Estudados Recentemente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCodes.slice(0, 3).map(codeId => {
                const code = legalCodes.find(c => c.id === codeId);
                if (!code) return null;
                
                return (
                  <Link key={code.id} to={`/codigos/${code.id}`}>
                    <Card className="hover:shadow-md transition-shadow bg-netflix-dark border border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Scale className="h-8 w-8 text-law-accent" />
                          <div>
                            <h3 className="font-semibold text-white">{code.title}</h3>
                            <p className="text-sm text-gray-400">{code.shortTitle}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-law-accent" />
            Recomendado para Você
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((item, index) => (
              <RecommendationCard key={index} {...item} />
            ))}
          </div>
        </motion.section>

        {/* Featured Codes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-law-accent" />
              Códigos em Destaque
            </h2>
            <Link 
              to="/codigos" 
              className="text-law-accent hover:underline text-sm"
            >
              Ver todos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCodes.map(code => (
              <motion.div
                key={code.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/codigos/${code.id}`}
                  className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-netflix-dark border-gray-800 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif font-bold text-lg text-netflix-red group-hover:text-law-accent transition-colors">
                      {code.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="bg-netflix-red/10 text-netflix-red"
                    >
                      {code.shortTitle}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {code.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Index;
