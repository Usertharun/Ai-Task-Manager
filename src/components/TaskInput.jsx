import React, { useState, useEffect } from 'react';
import { getTodayStr, getTomorrowStr } from '../hooks/useTasks';
import { useVoice } from '../hooks/useVoice';

export const TaskInput = ({ onAdd, pendingCount, initialTitle = '', onClearInitialTitle }) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
      const input = document.getElementById('task-title-input');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }
  }, [initialTitle]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [estimate, setEstimate] = useState('30m');
  const [bucket, setBucket] = useState('Today');
  const [energy, setEnergy] = useState('Deep Work');
  const [motivation, setMotivation] = useState('');
  const [frictionWarning, setFrictionWarning] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);

  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoice();

  // Route transcript directly into native title state securely
  useEffect(() => {
    if (isListening && transcript) setTitle(transcript);
  }, [isListening, transcript]);

  // Auto-clear friction warning if user types / modifies inputs meaning they reconsidered
  useEffect(() => {
    if (frictionWarning) setFrictionWarning(false);
  }, [title]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !motivation.trim()) return;
    
    // Smart Friction Logic
    if (pendingCount >= 5 && !frictionWarning) {
      setFrictionWarning(true);
      setTriggerShake(true);
      setTimeout(() => setTriggerShake(false), 500);
      return; 
    }

    const targetDateObj = bucket === 'Today' ? getTodayStr() : (bucket === 'Tomorrow' ? getTomorrowStr() : '');
    
    onAdd(title, description, category, priority, estimate, targetDateObj, energy, motivation);
    
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setPriority('Medium');
    setEstimate('30m');
    setBucket('Today');
    setEnergy('Deep Work');
    setMotivation('');
    setFrictionWarning(false);
    if (onClearInitialTitle) onClearInitialTitle();
  };

  return (
    <form className={`task-form task-input-animate ${triggerShake ? 'shake-animation' : ''}`} onSubmit={handleSubmit}>
      <div className="input-group focus-glow-container">
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="task-title-input"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTranscript(e.target.value); }}
            required
            autoFocus
            className="glow-input title-input"
            style={{ paddingRight: '2.5rem' }}
          />
          <button 
            type="button" 
            className={`mic-btn-inline ${isListening ? 'pulse-anim listening' : ''}`} 
            onClick={() => isListening ? stopListening() : startListening()}
            title="Start Dictation"
          >
            🎤
          </button>
        </div>
        
        {/* Why Mode Requirement */}
        <input
          type="text"
          placeholder="Why are you doing this? (Required)"
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          required
          className="glow-input motivation-input"
          style={{ borderLeft: '3px solid var(--primary-color)' }}
        />

        <div className="input-row">
          <select value={energy} onChange={(e) => setEnergy(e.target.value)} className="select-input glow-input">
            <option value="Deep Work">🧠 Deep Work</option>
            <option value="Light Work">📝 Light Work</option>
            <option value="Low Energy">🔋 Low Energy</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-input glow-input">
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`priority-select select-input glow-input priority-${priority.toLowerCase()}`}>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select value={estimate} onChange={(e) => setEstimate(e.target.value)} className="select-input glow-input">
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="2h">2 Hours</option>
            <option value="4h">4 Hours</option>
          </select>
          <select value={bucket} onChange={(e) => setBucket(e.target.value)} className="select-input glow-input">
            <option value="Today">Scheduled for Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="Later">Later</option>
          </select>
        </div>
        
        <textarea
          placeholder="Add context (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          className="glow-input"
        />
      </div>

      {frictionWarning && (
        <div className="friction-warning">
          <strong>⚠️ Overload Warning:</strong> You currently have {pendingCount} unresolved tasks targeted for Today. 
          Consider finishing existing tasks first to avoid burnout! Click "Force Add" if you strictly need this.
        </div>
      )}

      <button type="submit" className="add-button" disabled={!title.trim() || !motivation.trim()}>
        {frictionWarning ? 'Force Add Anyway' : 'Create Task'}
        {!frictionWarning && (
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        )}
      </button>
    </form>
  );
};
