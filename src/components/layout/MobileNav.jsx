import React from 'react';

export const MobileNav = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="mobile-bottom-nav">
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
      <button className="nav-item focus-active-item" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        <span className="nav-icon">↑</span> Top
      </button>
    </nav>
  );
};
