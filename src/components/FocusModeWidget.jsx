import React, { useState, useEffect } from 'react';

export const FocusModeWidget = ({ task, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Utilize JS alert overlay visually warning the user of block transition
      alert("Pomodoro Session Complete! 🎯\nTake a minute to evaluate your progress and consider taking a short 5-minute break.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };

  if (!task) return null;

  return (
    <div className="focus-widget-container animate-slide-up">
      <div className="focus-header">
        <span className="focus-title">🎯 Focus Mode</span>
        <button className="focus-exit-btn" onClick={onExit} title="Exit Focus">✕</button>
      </div>
      
      <div className="focus-task-name">{task.title}</div>
      <div className="focus-timer-display">{formatTime(timeLeft)}</div>
      
      <div className="focus-controls">
        <button onClick={toggleTimer} className={`focus-btn ${isActive ? 'btn-pause' : 'btn-start'}`}>
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button onClick={resetTimer} className="focus-btn btn-reset" title="Reset to 25m">↻</button>
      </div>
    </div>
  );
};
