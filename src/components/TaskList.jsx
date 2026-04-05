import React, { useMemo } from 'react';
import { TaskItem } from './TaskItem';
import { getTodayStr, getTomorrowStr } from '../hooks/useTasks';

export const TaskList = ({ 
  tasks, 
  onToggle, 
  onDelete, 
  onUpdate, 
  onAddSubtask, 
  onAddMultipleSubtasks,
  onToggleSubtask, 
  onDeleteSubtask,
  onFocus
}) => {
  const [activeBreakdownTaskId, setActiveBreakdownTaskId] = React.useState(null);

  const onToggleBreakdown = (taskId) => {
    setActiveBreakdownTaskId(prev => prev === taskId ? null : taskId);
  };

  const focusInput = () => {
    const input = document.getElementById('task-title-input');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input.focus(), 300);
    }
  };

  const groupedTasks = useMemo(() => {
    const groups = { Overdue: [], Today: [], Tomorrow: [], Later: [] };
    const todayStr = getTodayStr();
    const tomorrowStr = getTomorrowStr();

    tasks.forEach(t => {
      // Logic for completed tasks targeting 'Today' vs 'Later'
      if (t.completed) {
        if (t.completedAt && t.completedAt.startsWith(todayStr)) {
           groups.Today.push(t);
        } else {
           groups.Later.push(t);
        }
        return;
      }

      // Pending logic buckets
      if (!t.targetDate) {
        groups.Later.push(t);
      } else if (t.targetDate < todayStr) {
        groups.Overdue.push(t);
      } else if (t.targetDate === todayStr) {
        groups.Today.push(t);
      } else if (t.targetDate === tomorrowStr) {
        groups.Tomorrow.push(t);
      } else {
        groups.Later.push(t); // Anything past tomorrow is later
      }
    });

    return groups;
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-illustration">
          <div className="empty-icon-ring"></div>
          <div className="empty-icon">✓</div>
        </div>
        <h2 className="empty-title">Clear Space, Clear Mind</h2>
        <p className="empty-subtitle">You have no pending tasks. Enjoy your free time or start planning ahead.</p>
        <button onClick={focusInput} className="empty-cta-button">
          Create Your First Task
        </button>
      </div>
    );
  }

  const renderGroup = (title, groupTasks, styleClass) => {
    if (groupTasks.length === 0) return null;
    return (
      <div className={`task-group ${styleClass}`}>
        <h4 className="group-header">{title} <span className="group-count">{groupTasks.length}</span></h4>
        <div className="task-list">
          {groupTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={onToggle} 
              onDelete={onDelete} 
              onUpdate={onUpdate}
              onAddSubtask={onAddSubtask}
              onAddMultipleSubtasks={onAddMultipleSubtasks}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onFocus={onFocus}
              isActiveBreakdown={activeBreakdownTaskId === task.id}
              onToggleBreakdown={onToggleBreakdown}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="task-groups-container">
      {renderGroup('🚨 Overdue', groupedTasks.Overdue, 'group-overdue')}
      {renderGroup('📌 Scheduled for Today', groupedTasks.Today, 'group-today')}
      {renderGroup('⏱️ Tomorrow', groupedTasks.Tomorrow, 'group-tomorrow')}
      {renderGroup('📅 Later', groupedTasks.Later, 'group-later')}
    </div>
  );
};
