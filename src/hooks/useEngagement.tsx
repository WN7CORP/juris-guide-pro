
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface EngagementMetrics {
  sessionTime: number;
  articlesRead: number;
  searchesPerformed: number;
  lastActivity: Date;
  streakDays: number;
}

export const useEngagement = () => {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    sessionTime: 0,
    articlesRead: 0,
    searchesPerformed: 0,
    lastActivity: new Date(),
    streakDays: 0
  });
  const [sessionStart] = useState(new Date());
  const location = useLocation();

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionTime: Math.floor((new Date().getTime() - sessionStart.getTime()) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Track page views and engagement
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      lastActivity: new Date()
    }));
  }, [location.pathname]);

  const trackArticleRead = () => {
    setMetrics(prev => ({
      ...prev,
      articlesRead: prev.articlesRead + 1,
      lastActivity: new Date()
    }));
  };

  const trackSearch = () => {
    setMetrics(prev => ({
      ...prev,
      searchesPerformed: prev.searchesPerformed + 1,
      lastActivity: new Date()
    }));
  };

  const formatSessionTime = () => {
    const minutes = Math.floor(metrics.sessionTime / 60);
    const seconds = metrics.sessionTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    metrics,
    trackArticleRead,
    trackSearch,
    formatSessionTime
  };
};
