import React from 'react';

export const Sidebar = ({ activeTab, setActiveTab, stats }) => {
  return (
    <aside className="layout-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <h2 className="sidebar-label">TaskManager</h2>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="nav-icon" title="Tasks">✓</span> 
          <span className="sidebar-label">Tasks</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon" title="Analytics">📊</span> 
          <span className="sidebar-label">Analytics</span>
        </button>
      </nav>

      <div className="sidebar-mini-stats">
        <div className="mini-stat">
          <span className="sidebar-label">Level</span>
          <span className="sidebar-mini-icon-only">⭐</span>
          <strong>{stats.level}</strong>
        </div>
        <div className="mini-stat">
          <span className="sidebar-label">Streak</span>
          <span className="sidebar-mini-icon-only">🔥</span>
          <strong>{stats.streak}d</strong>
        </div>
      </div>
    </aside>
  );
};
