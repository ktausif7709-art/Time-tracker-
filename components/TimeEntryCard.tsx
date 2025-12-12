
import React from 'react';
import { TimeEntry, Project } from '../types';
import { Trash2, Clock, Calendar, Briefcase } from 'lucide-react';

interface TimeEntryCardProps {
  entry: TimeEntry;
  project?: Project;
  onDelete: (id: string) => void;
}

const formatHoursMinutes = (decimalHours: number) => {
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${m}m`;
};

export const TimeEntryCard: React.FC<TimeEntryCardProps> = ({ entry, project, onDelete }) => {
  const task = project?.tasks.find(t => t.id === entry.taskId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: project?.color || '#cbd5e1' }}
            />
            <h4 className="font-semibold text-slate-800">{project?.name || 'Unknown Project'}</h4>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="font-medium text-slate-700">{formatHoursMinutes(entry.hours)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{entry.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>{task?.name || 'General Task'}</span>
            </div>
          </div>
          
          {entry.notes && (
            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border-l-2 border-slate-300 italic">
              "{entry.notes}"
            </p>
          )}
        </div>
        
        <button 
          onClick={() => onDelete(entry.id)}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Delete entry"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
