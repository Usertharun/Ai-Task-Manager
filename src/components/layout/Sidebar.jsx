import React from 'react';

export const Sidebar = ({ activeTab, setActiveTab, stats }) => {
  return (
    <aside className="layout-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <h2>TaskManager</h2>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="nav-icon">✓</span> Tasks
        </button>
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span> Analytics
        </button>
      </nav>

      <div className="sidebar-mini-stats">
        <div className="mini-stat">
          <span>Level</span>
          <strong>{stats.level}</strong>
        </div>
        <div className="mini-stat">
          <span>Streak 🔥</span>
          <strong>{stats.streak}d</strong>
        </div>
      </div>
    </aside>
  );
};
