import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../hooks/useVoice';
import { getTodayStr } from '../hooks/useTasks';

export const QuickCapture = ({ onAdd, pendingCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [autoSaveVoice, setAutoSaveVoice] = useState(false);

  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoice();
  const inputRef = useRef(null);

  // Global Keyboard Shortcut Intercept (Ctrl + Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        stopListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stopListening]);

  // Focus input aggressively when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Web Speech Synchronizer
  useEffect(() => {
    if (isListening && transcript) {
       setTitle(transcript);
    }
    
    // Auto-Save Execution when microphone detects silence
    if (!isListening && autoSaveVoice && title.trim() && transcript) {
       handleFastSubmit();
    }
  }, [isListening, transcript, autoSaveVoice]);

  const handleFastSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    // By passing 'Smart Friction Warning' directly by logging standard parameters blindly
    onAdd(
      title, 
      '', 
      'Personal', 
      'Medium', 
      '30m', 
      getTodayStr(), 
      'Deep Work', 
      'Quick Captured Thought' // Default Motivation
    );

    setTitle('');
    setTranscript('');
    setIsOpen(false);
    stopListening();
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // Debt Engine Calculation
  const debtPercent = Math.min(100, (pendingCount / 5) * 100);
  const debtColor = debtPercent >= 100 ? 'var(--danger)' : (debtPercent >= 60 ? 'var(--warning)' : 'var(--success)');

  if (!isOpen) return null;

  return (
    <div className="quick-capture-overlay animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setIsOpen(false) }}>
      <div className="quick-capture-panel animate-scale-up">
        
        <div className="quick-capture-header">
           <span className="quick-capture-title">⚡ Quick Capture</span>
           <span className="quick-capture-esc">ESC to close</span>
        </div>

        <form onSubmit={handleFastSubmit} className="quick-capture-form">
          <div className="quick-capture-input-wrap">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="What's strictly on your mind?"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTranscript(e.target.value); }}
              className="quick-capture-input"
            />
            <button 
              type="button" 
              className={`mic-btn ${isListening ? 'listening pulse-anim' : ''}`} 
              onClick={handleMicToggle}
              title="Voice type (Draft Mode)"
            >
              🎤
            </button>
          </div>
          
          <div className="quick-capture-controls">
            <label className="checkbox-label" title="Automatically create task when you stop speaking!">
               <input type="checkbox" checked={autoSaveVoice} onChange={(e) => setAutoSaveVoice(e.target.checked)} />
               <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Voice Auto-Save</span>
            </label>
            <button type="submit" className="qc-submit-btn" disabled={!title.trim() && !isListening}>Add Task</button>
          </div>
        </form>

        <div className="visual-debt-container">
           <div className="debt-header">
              <span>Visual Debt</span>
              <span>{pendingCount} Pending</span>
           </div>
           <div className="debt-bar-bg">
              <div className="debt-bar-fill" style={{width: `${debtPercent}%`, backgroundColor: debtColor}}></div>
           </div>
           {pendingCount >= 5 && <div className="debt-warning-text">You are carrying heavy mental load! Address existing tasks soon.</div>}
        </div>

      </div>
    </div>
  );
};
