
import { useState, useEffect } from "react";

interface HistoryItem {
  id: string;
  title: string;
  path: string;
  timestamp: number;
}

export function useViewHistory(maxItems: number = 10) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem('viewHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse view history:', e);
        localStorage.removeItem('viewHistory');
      }
    }
  }, []);

  const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    setHistory(prevHistory => {
      // Remove if already exists to prevent duplicates
      const filteredHistory = prevHistory.filter(h => h.id !== item.id);
      
      // Add new item at the beginning with current timestamp
      const newHistory = [
        { ...item, timestamp: Date.now() },
        ...filteredHistory
      ].slice(0, maxItems); // Keep only the most recent items
      
      // Save to localStorage
      localStorage.setItem('viewHistory', JSON.stringify(newHistory));
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('viewHistory');
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    clearHistory
  };
}
