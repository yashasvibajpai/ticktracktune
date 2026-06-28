import React, { useState } from 'react';
import type { Task, TaskListGroup } from '../types';
import { CheckCircle2, Circle, Trash2, Plus, PlayCircle, FolderPlus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  activeTaskId?: string;
  lists: TaskListGroup[];
  activeListId: string;
  onListSelect: (id: string) => void;
  onListAdd: (name: string) => void;
  onTaskAdd: (title: string, estimatedTime?: number) => void;
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskSelect: (id: string | undefined) => void;
}

export default function TaskList({
  tasks,
  activeTaskId,
  lists,
  activeListId,
  onListSelect,
  onListAdd,
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
  onTaskSelect
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEst, setNewTaskEst] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onTaskAdd(newTaskTitle.trim(), newTaskEst ? parseInt(newTaskEst) * 60 : undefined);
      setNewTaskTitle('');
      setNewTaskEst('');
    }
  };

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onListAdd(newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-wood-400 pb-2 gap-2">
        <h2 className="text-xl font-bold text-wood-900">Tasks</h2>
        <div className="flex items-center gap-2 overflow-x-auto">
           {lists.map(list => (
             <button
               key={list.id}
               onClick={() => onListSelect(list.id)}
               className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                 activeListId === list.id
                   ? 'bg-wood-800 text-wood-100'
                   : 'bg-white/50 text-wood-900 hover:bg-wood-400'
               }`}
             >
               {list.name}
             </button>
           ))}
           {!isAddingList ? (
             <button
               onClick={() => setIsAddingList(true)}
               className="p-1.5 text-wood-600 hover:text-wood-900 bg-white/50 hover:bg-wood-400 rounded-md transition-colors"
               title="New List"
             >
               <FolderPlus size={18} />
             </button>
           ) : (
             <form onSubmit={handleListSubmit} className="flex items-center gap-1">
               <input
                 type="text"
                 autoFocus
                 value={newListName}
                 onChange={(e) => setNewListName(e.target.value)}
                 onBlur={() => setIsAddingList(false)}
                 placeholder="List name..."
                 className="px-2 py-1 text-sm bg-white/70 border border-wood-400 rounded-md focus:outline-none focus:ring-2 focus:ring-wood-600 w-32"
               />
             </form>
           )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What are you working on?"
          className="flex-1 px-4 py-2 bg-white/70 border border-wood-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-600 placeholder-wood-600/50 text-wood-900"
        />
        <input
          type="number"
          value={newTaskEst}
          onChange={(e) => setNewTaskEst(e.target.value)}
          placeholder="Est. min"
          className="w-24 px-4 py-2 bg-white/70 border border-wood-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-600 placeholder-wood-600/50 text-wood-900"
          min="1"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="px-4 py-2 bg-wood-800 text-wood-100 rounded-lg hover:bg-wood-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </form>

      <ul className="space-y-3">
        {tasks.length === 0 && (
          <li className="text-center text-wood-600 italic py-4">No tasks yet. Add one above!</li>
        )}
        {tasks.map((task) => {
          const isActive = activeTaskId === task.id;
          const progress = task.estimatedTime && task.estimatedTime > 0
            ? Math.min(100, Math.round((task.totalTimeSpent / task.estimatedTime) * 100))
            : 0;

          return (
            <li
              key={task.id}
              className={`group flex flex-col p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'bg-white border-wood-800 shadow-md transform scale-[1.01]'
                  : 'bg-white/50 border-transparent hover:border-wood-400 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className="text-wood-600 hover:text-wood-800 transition-colors flex-shrink-0"
                >
                  {task.completed ? <CheckCircle2 size={24} className="text-green-600" /> : <Circle size={24} />}
                </button>

                <span className={`flex-1 font-medium text-lg ${task.completed ? 'line-through text-wood-600/60' : 'text-wood-900'}`}>
                  {task.title}
                </span>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                  <button
                    onClick={() => onTaskSelect(isActive ? undefined : task.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-wood-800 text-wood-100' : 'text-wood-600 hover:bg-wood-400 hover:text-wood-900'
                    }`}
                    title={isActive ? "Deselect Task" : "Work on Task"}
                  >
                    <PlayCircle size={20} />
                  </button>
                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="p-2 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Progress and Time Stats */}
              <div className="mt-3 pl-9 flex items-center justify-between text-sm text-wood-600">
                <span>{formatTime(task.totalTimeSpent)} spent</span>
                {task.estimatedTime && (
                  <div className="flex items-center gap-3 w-1/2 justify-end">
                    <span>{progress}% of {formatTime(task.estimatedTime)}</span>
                    <div className="h-2 w-24 bg-wood-400/30 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-wood-600'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
