import { useReducer, useCallback, useEffect } from 'react';
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

const tasksReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK': {
      return [action.payload, ...state];
    }
    case 'UPDATE_TASK': {
      return state.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t);
    }
    case 'TOGGLE_TASK': {
      return state.map(t => {
        if (t.id === action.payload.id) {
          const isCompleting = !t.completed;
          return { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : null };
        }
        return t;
      });
    }
    case 'DELETE_TASK': {
      return state.filter(t => t.id !== action.payload.id);
    }
    case 'ADD_MULTIPLE_TASKS': {
      return [...action.payload, ...state];
    }
    case 'BULK_UPDATE_TASKS': {
      return state.map(t => action.payload.idsArray.includes(t.id) ? { ...t, ...action.payload.updates } : t);
    }
    case 'ADD_MULTIPLE_SUBTASKS': {
      return state.map(t => {
        if (t.id === action.payload.taskId) {
           return { 
             ...t, 
             subtasks: [...(t.subtasks || []), ...action.payload.newSubtasks], 
             completed: false,
             completedAt: null
           };
        }
        return t;
      });
    }
    case 'ADD_SUBTASK': {
      return state.map(t => {
        if (t.id === action.payload.taskId) {
          return { ...t, subtasks: [...(t.subtasks || []), action.payload.newSubtask], completed: false, completedAt: null };
        }
        return t;
      });
    }
    case 'TOGGLE_SUBTASK': {
      return state.map(t => {
        if (t.id === action.payload.taskId) {
          const newSubtasks = (t.subtasks || []).map(st => 
            st.id === action.payload.subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
          const newlyCompleted = allCompleted && !t.completed;
          return { ...t, subtasks: newSubtasks, completed: allCompleted ? true : t.completed, completedAt: newlyCompleted ? new Date().toISOString() : t.completedAt };
        }
        return t;
      });
    }
    case 'DELETE_SUBTASK': {
      return state.map(t => {
        if (t.id === action.payload.taskId) {
          const newSubtasks = (t.subtasks || []).filter(st => st.id !== action.payload.subtaskId);
          const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
          const newlyCompleted = allCompleted && !t.completed;
          return { ...t, subtasks: newSubtasks, completed: allCompleted ? true : t.completed, completedAt: newlyCompleted ? new Date().toISOString() : t.completedAt };
        }
        return t;
      });
    }
    default:
      return state;
  }
};

export const useTasks = () => {
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((title, description, category, priority, estimate, targetDate, energy, motivation) => {
    if (!title?.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      estimate: estimate || '30m',
      energy: energy || 'Deep Work',
      motivation: motivation?.trim() || '',
      targetDate: targetDate !== undefined && targetDate !== null ? targetDate : getTodayStr(),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: [],
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  }, []);

  const updateTask = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const toggleTask = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { id } });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  }, []);

  const addMultipleTasks = useCallback((tasksArray) => {
    const newTasks = tasksArray.filter(t => t.title?.trim()).map((t) => ({
      id: crypto.randomUUID(),
      title: t.title.trim(),
      description: t.description?.trim() || '',
      category: ['Work', 'Study', 'Personal'].includes(t.category) ? t.category : 'Personal',
      priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
      estimate: t.estimate || '30m',
      targetDate: t.targetDate !== undefined && t.targetDate !== null ? t.targetDate : '',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      subtasks: [],
    }));
    if (newTasks.length > 0) {
      dispatch({ type: 'ADD_MULTIPLE_TASKS', payload: newTasks });
    }
  }, []);

  const bulkUpdateTasks = useCallback((idsArray, updates) => {
     if (idsArray.length > 0) {
       dispatch({ type: 'BULK_UPDATE_TASKS', payload: { idsArray, updates } });
     }
  }, []);

  const addMultipleSubtasks = useCallback((taskId, subtasksArray) => {
    const newSubtasks = subtasksArray.filter(st => st.title?.trim()).map((st) => ({
      id: crypto.randomUUID(),
      title: st.title.trim(),
      completed: false
    }));
    if (newSubtasks.length > 0) {
      dispatch({ type: 'ADD_MULTIPLE_SUBTASKS', payload: { taskId, newSubtasks } });
    }
  }, []);

  const addSubtask = useCallback((taskId, title) => {
    if (!title?.trim()) return;
    dispatch({ type: 'ADD_SUBTASK', payload: { 
      taskId, 
      newSubtask: { id: crypto.randomUUID(), title: title.trim(), completed: false } 
    }});
  }, []);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subtaskId } });
  }, []);

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subtaskId } });
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
