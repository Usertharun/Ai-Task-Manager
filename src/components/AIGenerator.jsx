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
      
      {generatedSteps.length > 0 && (
        <div className="ai-steps-container">
          <p className="ai-steps-title">Suggested Tasks (Click to convert):</p>
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
                {step.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
