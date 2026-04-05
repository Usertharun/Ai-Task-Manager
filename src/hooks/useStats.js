import { useState, useEffect, useCallback } from 'react';

const loadStats = () => {
  const defaultStats = { xp: 0, streak: 0, lastCompletedDate: null, focusTime: 0 };
  try {
    const saved = localStorage.getItem('ai_tasks_stats');
    return saved ? JSON.parse(saved) : defaultStats;
  } catch {
    return defaultStats;
  }
};

const getTodayEpochStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const useStats = () => {
  const [stats, setStats] = useState(() => loadStats());

  useEffect(() => {
    localStorage.setItem('ai_tasks_stats', JSON.stringify(stats));
  }, [stats]);

  const level = Math.floor(Math.sqrt(stats.xp / 50)) + 1;
  const currentLevelXpBasis = 50 * Math.pow(level - 1, 2);
  const nextLevelXpBasis = 50 * Math.pow(level, 2);
  const progressPercent = ((stats.xp - currentLevelXpBasis) / (nextLevelXpBasis - currentLevelXpBasis)) * 100;

  const addXP = useCallback((amount) => {
    setStats(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const addFocusTime = useCallback((minutes) => {
    setStats(prev => ({ ...prev, focusTime: prev.focusTime + minutes }));
  }, []);

  const recordTaskCompletion = useCallback(() => {
    setStats(prev => {
      const todayEpoch = getTodayEpochStart();
      if (!prev.lastCompletedDate) {
        return { ...prev, streak: 1, lastCompletedDate: todayEpoch };
      }
      
      const diffDays = Math.round((todayEpoch - prev.lastCompletedDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return prev; // Completed another task today, streak remains same
      } else if (diffDays === 1) {
        return { ...prev, streak: prev.streak + 1, lastCompletedDate: todayEpoch };
      } else {
        return { ...prev, streak: 1, lastCompletedDate: todayEpoch }; // Broken streak
      }
    });
  }, []);

  return {
    ...stats,
    level,
    progressPercent,
    nextLevelXpBasis,
    addXP,
    addFocusTime,
    recordTaskCompletion
  };
};
