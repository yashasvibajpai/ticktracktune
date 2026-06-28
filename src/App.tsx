import React from 'react';
import type { Task, Session, SessionType, TaskListGroup } from './types';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import Reports from './components/Reports';
import MusicPlayer from './components/MusicPlayer';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro_tasks', []);
  const [sessions, setSessions] = useLocalStorage<Session[]>('pomodoro_sessions', []);
  const [lists, setLists] = useLocalStorage<TaskListGroup[]>('pomodoro_lists', [{ id: 'default', name: 'Default List' }]);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | undefined>('pomodoro_active_task', undefined);
  const [mode, setMode] = React.useState<SessionType>('work');
  const [tab, setTab] = React.useState<'timer' | 'reports'>('timer');

  const [activeListId, setActiveListId] = React.useState<string>('default');

  const handleTaskAdd = (title: string, estimatedTime?: number) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      totalTimeSpent: 0,
      estimatedTime,
      createdAt: Date.now(),
      listId: activeListId,
    };
    setTasks([...tasks, newTask]);
  };

  const handleListAdd = (name: string) => {
    const newList: TaskListGroup = {
      id: uuidv4(),
      name,
    };
    setLists([...lists, newList]);
    setActiveListId(newList.id);
  };

  const handleTaskToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(undefined);
  };

  const handleSessionComplete = (session: Session) => {
    setSessions([...sessions, session]);
    // Task time is now updated in real-time via handleTaskTick
  };

  const handleTaskTick = (taskId: string, elapsedSeconds: number) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const newTimeSpent = t.totalTimeSpent + elapsedSeconds;
        // Auto complete if we have an estimate and we reached it
        const isCompleted = t.estimatedTime ? newTimeSpent >= t.estimatedTime : t.completed;
        return { ...t, totalTimeSpent: newTimeSpent, completed: isCompleted };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-wood-100 flex flex-col items-center py-8 px-4">
      <header className="mb-8 w-full max-w-2xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-wood-900">Pomodoro Tracker</h1>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${tab === 'timer' ? 'bg-wood-800 text-wood-100' : 'bg-wood-400 text-wood-900 hover:bg-wood-600 hover:text-wood-100'}`}
            onClick={() => setTab('timer')}
          >
            Timer
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${tab === 'reports' ? 'bg-wood-800 text-wood-100' : 'bg-wood-400 text-wood-900 hover:bg-wood-600 hover:text-wood-100'}`}
            onClick={() => setTab('reports')}
          >
            Reports
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8">
        {tab === 'timer' && (
          <>
            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-wood-400">
              <Timer
                mode={mode}
                setMode={setMode}
                activeTaskId={activeTaskId}
                onSessionComplete={handleSessionComplete}
                onTaskTick={handleTaskTick}
              />
            </div>

            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-wood-400">
               <MusicPlayer mode={mode} />
            </div>

            <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-wood-400">
              <TaskList
                tasks={tasks.filter(t => (t.listId || 'default') === activeListId)}
                activeTaskId={activeTaskId}
                lists={lists}
                activeListId={activeListId}
                onListSelect={setActiveListId}
                onListAdd={handleListAdd}
                onTaskAdd={handleTaskAdd}
                onTaskToggle={handleTaskToggle}
                onTaskDelete={handleTaskDelete}
                onTaskSelect={setActiveTaskId}
              />
            </div>
          </>
        )}

        {tab === 'reports' && (
          <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-wood-400">
            <Reports sessions={sessions} tasks={tasks} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
