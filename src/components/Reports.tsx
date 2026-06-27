import { useState } from 'react';
import type { Session, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet } from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  sessions: Session[];
  tasks: Task[];
}

const COLORS = ['#6f1d1b', '#bb9457', '#99582a', '#432818', '#ffe6a7'];

export default function Reports({ sessions, tasks }: ReportsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const daysToLookBack = timeRange === 'week' ? 7 : 30;
  const startDate = startOfDay(subDays(new Date(), daysToLookBack));

  const filteredSessions = sessions.filter(s => isAfter(s.startTime, startDate));

  // Process data for charts
  const workSessions = filteredSessions.filter(s => s.type === 'work');

  // Data: Time spent per day
  const dailyDataMap = new Map<string, number>();
  for (let i = daysToLookBack - 1; i >= 0; i--) {
    const d = startOfDay(subDays(new Date(), i));
    dailyDataMap.set(format(d, 'MMM dd'), 0);
  }

  workSessions.forEach(s => {
    const dateStr = format(s.startTime, 'MMM dd');
    if (dailyDataMap.has(dateStr)) {
      dailyDataMap.set(dateStr, dailyDataMap.get(dateStr)! + s.duration / 60); // in minutes
    }
  });

  const dailyData = Array.from(dailyDataMap.entries()).map(([date, minutes]) => ({
    date,
    hours: Number((minutes / 60).toFixed(2))
  }));

  // Data: Time spent per task
  const taskDataMap = new Map<string, number>();
  workSessions.forEach(s => {
    if (s.taskId) {
      taskDataMap.set(s.taskId, (taskDataMap.get(s.taskId) || 0) + s.duration / 60);
    }
  });

  const taskData = Array.from(taskDataMap.entries()).map(([taskId, minutes]) => {
    const task = tasks.find(t => t.id === taskId);
    return {
      name: task ? task.title : 'Unknown Task',
      value: Number((minutes / 60).toFixed(2))
    };
  }).filter(t => t.value > 0);

  const exportExcel = () => {
    const wsData = filteredSessions.map(s => {
      const task = tasks.find(t => t.id === s.taskId);
      return {
        Date: format(s.startTime, 'yyyy-MM-dd HH:mm'),
        Type: s.type,
        'Duration (min)': Math.round(s.duration / 60),
        Task: task ? task.title : 'N/A'
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sessions");
    XLSX.writeFile(wb, `pomodoro_report_${timeRange}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Pomodoro Report - Last ${timeRange === 'week' ? '7' : '30'} Days`, 14, 22);

    doc.setFontSize(12);
    const totalHours = dailyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
    doc.text(`Total Focus Time: ${totalHours} hours`, 14, 32);

    const tableData = filteredSessions.map(s => {
        const task = tasks.find(t => t.id === s.taskId);
        return [
            format(s.startTime, 'yyyy-MM-dd HH:mm'),
            s.type,
            Math.round(s.duration / 60).toString(),
            task ? task.title : 'N/A'
        ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Date/Time', 'Session Type', 'Duration (min)', 'Task']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [67, 40, 24] }, // wood-900 approx
    });

    doc.save(`pomodoro_report_${timeRange}.pdf`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-wood-400">
        <h2 className="text-xl font-bold text-wood-900">Performance Reports</h2>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-white border border-wood-400 rounded-md text-wood-900 focus:outline-none focus:ring-2 focus:ring-wood-600"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button onClick={exportExcel} className="p-2 bg-wood-600 text-wood-100 rounded-md hover:bg-wood-800 transition-colors" title="Export to Excel">
            <FileSpreadsheet size={20} />
          </button>
          <button onClick={exportPDF} className="p-2 bg-wood-600 text-wood-100 rounded-md hover:bg-wood-800 transition-colors" title="Export to PDF">
            <Download size={20} />
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center text-wood-600 italic py-12">
          No sessions recorded in this time range. Time to focus!
        </div>
      ) : (
        <div className="space-y-8">
          {/* Bar Chart: Daily Focus Time */}
          <div className="bg-white/50 p-4 rounded-xl border border-wood-400">
            <h3 className="text-lg font-semibold text-wood-900 mb-4 text-center">Focus Time (Hours)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#bb9457" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#432818" fontSize={12} />
                  <YAxis stroke="#432818" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffe6a7', borderColor: '#432818', borderRadius: '8px', color: '#432818' }}
                    itemStyle={{ color: '#6f1d1b' }}
                  />
                  <Bar dataKey="hours" fill="#6f1d1b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Time per Task */}
          {taskData.length > 0 && (
            <div className="bg-white/50 p-4 rounded-xl border border-wood-400">
              <h3 className="text-lg font-semibold text-wood-900 mb-4 text-center">Time per Task (Hours)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {taskData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffe6a7', borderColor: '#432818', borderRadius: '8px', color: '#432818' }}
                      itemStyle={{ color: '#432818' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
