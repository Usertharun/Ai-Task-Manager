import React, { Suspense } from 'react';
import { TaskList } from '../TaskList';
import { TaskInput } from '../TaskInput';

const Dashboard = React.lazy(() => import('../Dashboard').then(m => ({ default: m.Dashboard })));
const AIGenerator = React.lazy(() => import('../AIGenerator').then(m => ({ default: m.AIGenerator })));

export const MainContent = ({ activeTab, tasks, stats, taskHandlers }) => {
  const [prefilledTaskTitle, setPrefilledTaskTitle] = React.useState('');

  return (
    <main className="layout-main-content">
       {activeTab === 'dashboard' ? (
         <Suspense fallback={<div className="loading-spinner"></div>}>
           <Dashboard tasks={tasks} stats={stats} />
         </Suspense>
       ) : (
         <>
           <Suspense fallback={null}>
             <AIGenerator 
               onAddMultiple={taskHandlers.addMultipleTasks} 
               onSelectStep={setPrefilledTaskTitle}
             />
           </Suspense>
           
           <div className="divider-container">
             <div className="divider"></div>
             <span className="divider-text">OR CREATE MANUALLY</span>
             <div className="divider"></div>
           </div>

           <TaskInput 
             onAdd={taskHandlers.handleWrappedTaskAdd} 
             pendingCount={taskHandlers.pendingActionable} 
             initialTitle={prefilledTaskTitle}
             onClearInitialTitle={() => setPrefilledTaskTitle('')}
           />
           
           <div className="spacer" style={{ margin: '1.5rem 0' }}></div>
           
           <div className="main-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2>Your Tasks</h2>
             <button onClick={taskHandlers.handlePlanMyDay} className="plan-day-btn outline-btn" disabled={taskHandlers.isPlanning}>
                {taskHandlers.isPlanning ? <div className="loading-spinner small"></div> : '✨ Plan My Day'}
             </button>
           </div>
           
           <TaskList 
             tasks={tasks} 
             onToggle={taskHandlers.handleToggleTask} 
             onDelete={taskHandlers.handleWrappedTaskDelete} 
             onUpdate={taskHandlers.updateTask}
             onAddSubtask={taskHandlers.addSubtask}
             onAddMultipleSubtasks={taskHandlers.addMultipleSubtasks}
             onToggleSubtask={taskHandlers.toggleSubtask}
             onDeleteSubtask={taskHandlers.deleteSubtask}
             onFocus={taskHandlers.setActiveFocusTask}
           />
         </>
       )}
    </main>
  );
};
