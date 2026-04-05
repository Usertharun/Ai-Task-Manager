import React, { useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster, toast } from 'react-hot-toast';
import { useTasks, getTodayStr } from './hooks/useTasks';
import { useStats } from './hooks/useStats';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainContent } from './components/layout/MainContent';
import { RightPanel } from './components/layout/RightPanel';
import { MobileNav } from './components/layout/MobileNav';
import { FocusModeWidget } from './components/FocusModeWidget';

const FallbackLoader = () => (
   <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem', gap: '1rem'}}>
      <div className="loading-spinner" style={{borderColor: 'rgba(99, 102, 241, 0.3)', borderTopColor: 'var(--primary-color)'}}></div>
      <div style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600'}}>Optimizing Chunks...</div>
   </div>
);

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="empty-state" style={{marginTop: '10vh', borderColor: 'var(--danger)'}}>
      <div className="empty-title" style={{color: 'var(--danger)'}}>⚠️ System Malfunction</div>
      <div className="empty-subtitle">{error.message}</div>
      <button className="empty-cta-button" onClick={resetErrorBoundary} style={{background: 'var(--danger)'}}>Re-initialize Environment</button>
    </div>
  );
}

function App() {
  const { 
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
  } = useTasks();

  const stats = useStats();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = React.useState('tasks');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isPlanning, setIsPlanning] = React.useState(false);
  const [activeFocusTask, setActiveFocusTask] = React.useState(null);

  const handleToggleTask = (id) => {
    const taskObj = tasks.find(t => t.id === id);
    if (taskObj && !taskObj.completed) {
      let earnedXP = 15;
      if (taskObj.estimate === '1h' || taskObj.estimate === '2h') earnedXP += 10;
      if (taskObj.estimate === '4h') earnedXP += 25;
      if (taskObj.energy === 'Deep Work') earnedXP += 20;
      stats.addXP(earnedXP);
      stats.recordTaskCompletion();
      toast.success('Task completed! +' + earnedXP + ' XP', { position: 'bottom-center', icon: '🎉' });
    }
    toggleTask(id);
  };

  const handleWrappedTaskAdd = (...args) => {
    addTask(...args);
    toast.success('Task created successfully!', { position: 'bottom-center' });
  };
  
  const handleWrappedTaskDelete = (id) => {
    deleteTask(id);
    toast.error('Task removed.', { position: 'bottom-center' });
  };

  const handlePlanMyDay = async () => {
    if (isPlanning) return;
    setIsPlanning(true);
    const loadingToastId = toast.loading('Sorting by priority...', { position: 'bottom-center' });
    try {
      const todayStr = getTodayStr();
      const unassignedTasks = tasks.filter(t => !t.completed && (!t.targetDate || t.targetDate > todayStr)); 
      
      if (unassignedTasks.length === 0) {
        toast.dismiss(loadingToastId);
        toast.success("No future tasks to schedule.", { position: 'bottom-center' });
        setIsPlanning(false);
        return; 
      }

      // Local Logic: High Priority > Energy > Low Time
      const getPrioVal = (p) => p === 'High' ? 3 : (p === 'Medium' ? 2 : 1);
      const getEnergyVal = (e) => e === 'Deep Work' ? 3 : (e === 'Light Work' ? 2 : 1);
      const getTimeVal = (t) => t.includes('m') ? parseInt(t) : parseInt(t) * 60; 

      unassignedTasks.sort((a, b) => {
         const pA = getPrioVal(a.priority); const pB = getPrioVal(b.priority);
         if (pA !== pB) return pB - pA;
         const eA = getEnergyVal(a.energy); const eB = getEnergyVal(b.energy);
         if (eA !== eB) return eB - eA;
         return getTimeVal(a.estimate) - getTimeVal(b.estimate);
      });
      
      const topTasks = unassignedTasks.slice(0, Math.min(4, unassignedTasks.length));
      const plannedIds = topTasks.map(t => t.id);
      
      if (plannedIds.length > 0) {
        bulkUpdateTasks(plannedIds, { targetDate: todayStr });
        toast.success(`Planned ${plannedIds.length} high-priority tasks for Today!`, { id: loadingToastId });
      }
    } catch (err) {
       toast.error("Planning failed.", { id: loadingToastId });
    } finally {
      setIsPlanning(false);
    }
  };

  const todayStr = getTodayStr();
  const completedTodayCount = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)).length;
  const pendingActionable = tasks.filter(t => !t.completed && t.targetDate && t.targetDate <= todayStr).length;
  
  const statsTotal = completedTodayCount + pendingActionable;
  const progress = statsTotal === 0 ? 0 : Math.round((completedTodayCount / statsTotal) * 100);
  const progressColor = progress < 30 ? 'var(--danger)' : (progress < 70 ? 'var(--warning)' : 'var(--success)');

  const taskHandlers = {
    handleWrappedTaskAdd, handleWrappedTaskDelete, handleToggleTask,
    updateTask, addSubtask, addMultipleSubtasks, toggleSubtask, deleteSubtask, setActiveFocusTask, handlePlanMyDay, addMultipleTasks, pendingActionable, isPlanning
  };

  return (
    <div className={`app-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster 
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } }
        }} 
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className="layout-content-wrapper">
         <Header 
           onToggleSidebar={() => setSidebarOpen(true)} 
           progress={progress} progressColor={progressColor} 
           theme={theme} toggleTheme={toggleTheme} 
         />

         <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
           <div className="layout-grid">
               <MainContent 
                 activeTab={activeTab} 
                 tasks={tasks} 
                 stats={stats} 
                 taskHandlers={taskHandlers} 
               />
               <RightPanel stats={stats} tasks={tasks} />
           </div>
         </ErrorBoundary>
      </div>

      <FocusModeWidget 
        task={activeFocusTask} 
        onExit={() => {
           stats.addFocusTime(25);
           setActiveFocusTask(null);
        }} 
      />

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} activeFocusTask={activeFocusTask} />
    </div>
  );
}

export default App;
