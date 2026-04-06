import React, { useState } from 'react';
import { generateTasks } from '../services/aiService';

export const AIGenerator = ({ onAddMultiple, onSelectStep }) => {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedSteps, setGeneratedSteps] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedSteps([]);
    
    try {
      const generatedTasks = await generateTasks(goal);
      if (generatedTasks && generatedTasks.length > 0) {
        setGeneratedSteps(generatedTasks);
        setGoal('');
      } else {
        setError('No tasks were returned by the AI.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with AI Service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAll = () => {
    if (generatedSteps.length > 0) {
      onAddMultiple(generatedSteps);
      setGeneratedSteps([]);
    }
  };

  return (
    <div className="ai-generator-container">
      <div className="ai-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-icon">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <h3>AI Task Breakdown</h3>
      </div>
      <p className="ai-description">Describe your overarching goal, and our AI will deconstruct it into optimized actionable steps.</p>
      
      <form onSubmit={handleSubmit} className="ai-form">
        <input
          type="text"
          placeholder="E.g., Launch an e-commerce website..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="glow-input ai-input"
          disabled={isGenerating}
        />
        <button type="submit" className="ai-submit-btn" disabled={!goal.trim() || isGenerating}>
          {isGenerating ? <div className="loading-spinner"></div> : 'Suggest Tasks ✨'}
        </button>
      </form>
      {error && <p className="ai-error">{error}</p>}
      
      {isGenerating && (
         <div className="skeleton-container" style={{marginTop: '1.5rem'}}>
            <div className="skeleton-line" style={{width: '60%', height: '1.5rem', marginBottom: '0.8rem'}}></div>
            <div className="skeleton-line" style={{width: '90%', height: '3rem', marginBottom: '0.5rem'}}></div>
            <div className="skeleton-line" style={{width: '80%', height: '3rem', marginBottom: '0.5rem'}}></div>
         </div>
      )}

      {generatedSteps.length > 0 && !isGenerating && (
        <div className="ai-steps-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <p className="ai-steps-title" style={{ margin: 0 }}>Suggested Tasks (Click to edit):</p>
             <button onClick={handleAddAll} className="add-button" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Add All as Tasks
             </button>
          </div>
          <div className="ai-steps-list">
            {generatedSteps.map((step, idx) => (
              <button 
                key={idx} 
                className="ai-step-btn"
                onClick={() => {
                  if (onSelectStep) onSelectStep(step.title);
                  setGeneratedSteps(prev => prev.filter((_, i) => i !== idx));
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{fontWeight: 600}}>{step.title}</span>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{step.priority} • {step.category}</span>
                </div>
                {step.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', textAlign: 'left' }}>{step.description}</div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
