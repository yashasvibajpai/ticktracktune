export interface Task {
  id: string;
  title: string;
  completed: boolean;
  totalTimeSpent: number; // in seconds
  estimatedTime?: number; // in seconds
  createdAt: number;
  listId?: string;
}

export interface TaskListGroup {
  id: string;
  name: string;
}

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface Session {
  id: string;
  taskId?: string;
  type: SessionType;
  duration: number; // in seconds
  startTime: number;
  endTime?: number;
  completed: boolean;
}
