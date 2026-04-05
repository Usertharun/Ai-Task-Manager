import { useState, useCallback, useEffect } from 'react';
import { loadTasks, saveTasks } from '../utils/localStorage';

export const getTodayStr = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().split('T')[0];
};

export const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export const useTasks = () => {
  const [tasks, setTasks] = useState(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((title, description, category, priority, estimate, targetDate, energy, motivation) => {
    if (!title.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      estimate: estimate || '30m',
      energy: energy || 'Deep Work',
      motivation: motivation?.trim() || '',
      targetDate: targetDate || getTodayStr(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: [],
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          return { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : null };
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addMultipleTasks = useCallback((tasksArray) => {
    const newTasks = tasksArray.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title?.trim() || 'Untitled Task',
      description: t.description?.trim() || '',
      category: ['Work', 'Study', 'Personal'].includes(t.category) ? t.category : 'Personal',
      priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
      estimate: t.estimate || '30m',
      targetDate: getTodayStr(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: [],
    }));
    setTasks((prev) => [...newTasks, ...prev]);
  }, []);

  const bulkUpdateTasks = useCallback((idsArray, updates) => {
     setTasks((prev) => prev.map((t) => idsArray.includes(t.id) ? { ...t, ...updates } : t));
  }, []);

  const addMultipleSubtasks = useCallback((taskId, subtasksArray) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id === taskId) {
        const newSubtasks = subtasksArray.map((st) => ({
          id: crypto.randomUUID(),
          title: st.title?.trim() || 'Subtask',
          completed: false
        }));
        return { 
          ...t, 
          subtasks: [...(t.subtasks || []), ...newSubtasks], 
          completed: false,
          completedAt: null
        };
      }
      return t;
    }));
  }, []);

  const addSubtask = useCallback((taskId, title) => {
    if (!title.trim()) return;
    setTasks((prev) => prev.map((t) => {
      if (t.id === taskId) {
        const newSubtasks = [...(t.subtasks || []), { id: crypto.randomUUID(), title: title.trim(), completed: false }];
        return { ...t, subtasks: newSubtasks, completed: false, completedAt: null };
      }
      return t;
    }));
  }, []);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
        const newlyCompleted = allCompleted && !t.completed;
        return { ...t, subtasks: newSubtasks, completed: allCompleted ? true : t.completed, completedAt: newlyCompleted ? new Date().toISOString() : t.completedAt };
      }
      return t;
    }));
  }, []);

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).filter(st => st.id !== subtaskId);
        const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
        const newlyCompleted = allCompleted && !t.completed;
        return { ...t, subtasks: newSubtasks, completed: allCompleted ? true : (newSubtasks.length === 0 ? t.completed : t.completed), completedAt: newlyCompleted ? new Date().toISOString() : t.completedAt };
      }
      return t;
    }));
  }, []);

  return { 
    tasks, 
    addTask, 
    updateTask, 
    bulkUpdateTasks,
    toggleTask, 
    deleteTask,
    addMultipleTasks,
    addSubtask,
    addMultipleSubtasks,
    toggleSubtask,
    deleteSubtask
  };
};
