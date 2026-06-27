import { useState, useEffect } from 'react';
import type { SessionType, Session } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Play, Pause, Square, SkipForward } from 'lucide-react';

interface TimerProps {
  mode: SessionType;
  setMode: (mode: SessionType) => void;
  activeTaskId?: string;
  onSessionComplete: (session: Session) => void;
  onTaskTick?: (taskId: string, elapsedSeconds: number) => void;
}

const DEFAULT_TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function Timer({ mode, setMode, activeTaskId, onSessionComplete, onTaskTick }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Variable work length input
  const [customTimeInput, setCustomTimeInput] = useState<number>(DEFAULT_TIMES[mode] / 60);

  useEffect(() => {
    // Reset timer when mode changes if not running
    if (!isRunning) {
      setTimeLeft(DEFAULT_TIMES[mode]);
      setCustomTimeInput(DEFAULT_TIMES[mode] / 60);
    }
  }, [mode, isRunning]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'work' && activeTaskId && onTaskTick) {
          onTaskTick(activeTaskId, 1);
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, activeTaskId, onTaskTick]);

  const handleStart = () => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true);
      if (!sessionStartTime) setSessionStartTime(Date.now());
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIMES[mode]);
    setSessionStartTime(null);
  };

  const handleComplete = () => {
    setIsRunning(false);
    const duration = DEFAULT_TIMES[mode]; // Or tracking actual passed time

    if (sessionStartTime) {
      onSessionComplete({
        id: uuidv4(),
        taskId: activeTaskId,
        type: mode,
        duration: duration,
        startTime: sessionStartTime,
        endTime: Date.now(),
        completed: true,
      });
    }

    // Auto transition mode
    if (mode === 'work') {
      setMode('shortBreak');
    } else {
      setMode('work');
    }
    setSessionStartTime(null);
  };

  const handleSkip = () => {
     handleComplete();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    if (!isNaN(minutes) && minutes > 0) {
      setCustomTimeInput(minutes);
      if (!isRunning) {
        setTimeLeft(minutes * 60);
        DEFAULT_TIMES[mode] = minutes * 60; // Update for current session type
      }
    } else {
      setCustomTimeInput(e.target.value as any);
    }
  };


  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-6">
        {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setMode(t);
              setIsRunning(false);
              setSessionStartTime(null);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              mode === t
                ? 'bg-wood-800 text-wood-100'
                : 'bg-wood-400 text-wood-900 hover:bg-wood-600 hover:text-wood-100'
            }`}
          >
            {t === 'work' ? 'Focus' : t === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="text-8xl font-bold text-wood-900 mb-8 tabular-nums tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-4 mb-6">
        {!isRunning ? (
          <button onClick={handleStart} className="p-4 bg-wood-800 text-wood-100 rounded-full hover:bg-wood-900 transition-colors shadow-md">
            <Play size={32} className="ml-1" />
          </button>
        ) : (
          <button onClick={handlePause} className="p-4 bg-wood-600 text-wood-100 rounded-full hover:bg-wood-800 transition-colors shadow-md">
            <Pause size={32} />
          </button>
        )}
        <button onClick={handleStop} className="p-4 bg-wood-400 text-wood-900 rounded-full hover:bg-wood-600 hover:text-wood-100 transition-colors shadow-md">
          <Square size={24} />
        </button>
        <button onClick={handleSkip} className="p-4 bg-wood-400 text-wood-900 rounded-full hover:bg-wood-600 hover:text-wood-100 transition-colors shadow-md">
          <SkipForward size={24} />
        </button>
      </div>

      {!isRunning && (
         <div className="flex items-center gap-2 mt-4 text-wood-800">
           <label htmlFor="customTime" className="text-sm font-medium">Session Length (min):</label>
           <input
             id="customTime"
             type="number"
             value={customTimeInput}
             onChange={handleCustomTimeChange}
             className="w-20 px-2 py-1 bg-white/50 border border-wood-400 rounded-md focus:outline-none focus:ring-2 focus:ring-wood-600 text-wood-900"
             min="1"
           />
         </div>
      )}
    </div>
  );
}
