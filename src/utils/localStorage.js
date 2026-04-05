export const loadTasks = () => {
  try {
    const savedTasks = localStorage.getItem('ai_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
  } catch (error) {
    console.error('Failed to load tasks from local storage:', error);
  }
  return [];
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem('ai_tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to local storage:', error);
  }
};
