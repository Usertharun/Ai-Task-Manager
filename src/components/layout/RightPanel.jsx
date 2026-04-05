import React, { Suspense } from 'react';

const AIAssistant = React.lazy(() => import('../AIAssistant').then(m => ({ default: m.AIAssistant })));

export const RightPanel = ({ stats, tasks }) => {
  return (
    <aside className="layout-right-panel glass-panel">
       <div className="insights-header">
         <h3>Insights</h3>
       </div>

       <div className="stat-card level-card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
          <div className="stat-title">Current Level</div>
          <div className="stat-number level-number" style={{ fontSize: '1.8rem' }}>Lvl {stats.level}</div>
          <div className="xp-progress-bar" style={{ height: '6px' }}>
             <div className="xp-progress" style={{ width: `${Math.min(100, Math.max(0, stats.progressPercent))}%` }}></div>
          </div>
          <div className="xp-label">{Math.floor(stats.xp)} / {Math.floor(stats.nextLevelXpBasis)} XP</div>
       </div>
       
       <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-card info-card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
             <div className="stat-title" style={{ fontSize: '0.75rem' }}>Streak 🔥</div>
             <div className="stat-number" style={{ fontSize: '1.4rem' }}>{stats.streak}d</div>
          </div>
          <div className="stat-card info-card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
             <div className="stat-title" style={{ fontSize: '0.75rem' }}>Focus 🎯</div>
             <div className="stat-number" style={{ fontSize: '1.4rem' }}>{stats.focusTime}m</div>
          </div>
       </div>

       <Suspense fallback={<div className="loading-spinner"></div>}>
          <div className="assistant-docker-wrapper">
             <AIAssistant tasks={tasks} stats={stats} />
          </div>
       </Suspense>
    </aside>
  );
};
