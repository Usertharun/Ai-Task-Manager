import React from 'react';
import { AnimatedCounter } from '../AnimatedCounter';

export const Header = ({ onToggleSidebar, progress, progressColor, theme, toggleTheme }) => {
  return (
    <header className="layout-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="header-title-container">
           <div className="logo-icon-mobile">⚡</div>
           <h1 className="mobile-title">AI Task Manager</h1>
        </div>
      </div>

      <div className="header-progress">
         <div className="progress-info">
             <span className="progress-label">Today's Progress</span>
             <span className="progress-text"><AnimatedCounter value={progress} />%</span>
         </div>
         <div className="progress-bar-bg">
             <div 
               className="progress-bar" 
               style={{ 
                 width: `${progress}%`,
                 background: progressColor,
                 boxShadow: progress > 0 ? `0 0 10px ${progressColor}` : 'none'
               }}
             ></div>
         </div>
      </div>

      <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
};
