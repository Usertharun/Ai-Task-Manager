import React, { memo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const TaskItem = memo(({ 
  task, 
  onToggle, 
  onDelete, 
  onUpdate, 
  onAddSubtask,
  onAddMultipleSubtasks,
  onToggleSubtask, 
  onDeleteSubtask,
  onFocus,
  isActiveBreakdown,
  onToggleBreakdown
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [expanded, setExpanded] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [breakdownGenerated, setBreakdownGenerated] = useState(null);

  const handleDelete = () => {
     setIsDeleting(true);
     setTimeout(() => onDelete(task.id), 350);
  };

  const handleUpdate = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUpdate();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const submitSubtask = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    onAddSubtask(task.id, subtaskInput);
    setSubtaskInput('');
    if (!expanded) setExpanded(true);
  };

  const handleAIBreakdown = async () => {
    if (isBreaking) return;
    setIsBreaking(true);
    setAiError(null);
    try {
      const { breakTask } = await import('../services/aiService');
      const generatedSubtasks = await breakTask(task.title, task.description);
      if (generatedSubtasks && generatedSubtasks.length > 0) {
        setBreakdownGenerated(generatedSubtasks);
      } else {
        setAiError("AI returned no logic breakdown.");
      }
    } catch (err) {
      setAiError(err.message || "Failed AI Request");
    } finally {
      setIsBreaking(false);
    }
  };

  useEffect(() => {
    if (isActiveBreakdown && !breakdownGenerated && !isBreaking && !aiError) {
      handleAIBreakdown();
    }
  }, [isActiveBreakdown]);

  const handleAddGeneratedSubtasks = () => {
    if (breakdownGenerated && breakdownGenerated.length > 0) {
      onAddMultipleSubtasks(task.id, breakdownGenerated);
      toast.success("Subtasks added!", { position: 'bottom-center' });
      setBreakdownGenerated(null);
      onToggleBreakdown(null);
      if (!expanded) setExpanded(true);
    }
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;

  return (
    <div className={`task-item ${task.completed ? 'completed completing-anim' : 'animate-entry'} ${isDeleting ? 'deleting-anim' : ''}`}>
      <div className="task-header-row">
        <div className="task-checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="task-checkbox"
            id={`task-${task.id}`}
          />
          <label htmlFor={`task-${task.id}`} className="task-custom-checkbox"></label>
        </div>
        
        <div className="task-content">
          <div className="task-badges">
            <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
            <span className="badge category-badge">{task.category}</span>
            {task.estimate && <span className="badge estimate-badge">⏳ {task.estimate}</span>}
            {task.energy && <span className={`badge energy-${task.energy.replace(' ', '').toLowerCase()}`}>⚡ {task.energy}</span>}
          </div>

          <div className="title-wrapper">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="inline-edit-input"
                autoFocus
              />
            ) : (
              <>
                <h3 className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}>
                  {task.title}
                </h3>
                <button className="inline-edit-btn" onClick={() => setIsEditing(true)}>✎</button>
                {!task.completed && <button className="inline-edit-btn" onClick={() => onFocus(task)} style={{marginLeft:'auto', opacity: 1, color:'var(--primary-color)'}} title="Enter Focus Mode">🎯 Focus</button>}
                {!task.completed && <button className="inline-edit-btn" onClick={() => onToggleBreakdown(task.id)} style={{opacity: 1, color: isActiveBreakdown ? 'var(--primary-color)' : 'var(--text-muted)'}} title="AI Task Breakdown">✨ Breakdown</button>}
              </>
            )}
          </div>

          {task.motivation && (
            <div className="task-motivation-panel">
               <span className="motivation-label">Why:</span> {task.motivation}
            </div>
          )}

          {task.description && <p className="task-description">{task.description}</p>}
        </div>

        <button 
          className="delete-button explicit-delete" 
          onClick={handleDelete}
          aria-label="Delete task"
        >
          🗑️ 
        </button>
      </div>

      <div className="subtasks-container">
        <button className="subtasks-toggle" onClick={() => setExpanded(!expanded)}>
          <span className={`toggle-icon ${expanded ? 'expanded' : ''}`}>▶</span> 
          Subtasks ({completedSubtasks}/{subtasks.length})
        </button>
        
        {expanded && (
          <div className="subtasks-list">
            {subtasks.map(st => (
              <div key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={st.completed} 
                  onChange={() => onToggleSubtask(task.id, st.id)}
                  className="subtask-checkbox"
                  id={`subtask-${st.id}`}
                />
                <span className="subtask-title">{st.title}</span>
                <button className="subtask-delete" onClick={() => onDeleteSubtask(task.id, st.id)}>×</button>
              </div>
            ))}
            {aiError && <p className="ai-subtask-error">{aiError}</p>}
            <form onSubmit={submitSubtask} className="subtask-form">
              <input 
                type="text" 
                placeholder="Add subtask manually..." 
                value={subtaskInput} 
                onChange={(e) => setSubtaskInput(e.target.value)}
                className="subtask-input"
              />
              <button type="submit" className="subtask-add-btn" disabled={!subtaskInput.trim()}>+</button>
            </form>
          </div>
        )}
      </div>

      {isActiveBreakdown && (
        <div className="task-breakdown-panel">
          <div className="task-breakdown-header">
            <h4>✨ Task Breakdown</h4>
            <button onClick={() => onToggleBreakdown(null)} className="close-breakdown-btn">×</button>
          </div>
          <div className="task-breakdown-content">
             {isBreaking ? (
                <div className="breakdown-loading">
                  <div className="loading-spinner small"></div>
                  <span>Analyzing task and generating optimal steps...</span>
                </div>
             ) : aiError ? (
                <div className="ai-subtask-error" style={{ marginBottom: '1rem' }}>
                   {aiError} <button onClick={handleAIBreakdown} className="inline-edit-btn" style={{opacity: 1}}>Try Again</button>
                </div>
             ) : breakdownGenerated && breakdownGenerated.length > 0 ? (
                <>
                   <ul className="breakdown-list">
                     {breakdownGenerated.map((st, i) => <li key={i}>{st.title}</li>)}
                   </ul>
                   <div className="breakdown-actions">
                     <button className="btn-cancel-breakdown" onClick={() => onToggleBreakdown(null)}>Cancel</button>
                     <button className="btn-add-breakdown" onClick={handleAddGeneratedSubtasks}>Add to Subtasks</button>
                   </div>
                </>
             ) : (
                <div className="breakdown-loading">
                  <span>Failed to parse breakdown.</span>
                  <button onClick={handleAIBreakdown} className="inline-edit-btn" style={{opacity: 1}}>Try Again</button>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
});

TaskItem.displayName = 'TaskItem';
