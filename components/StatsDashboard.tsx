
import React, { useMemo } from 'react';
import { TimeEntry, Project } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatsDashboardProps {
  entries: TimeEntry[];
  projects: Project[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ entries, projects }) => {
  const projectStats = useMemo(() => {
    const stats = projects.map(p => {
      const hours = entries
        .filter(e => e.projectId === p.id)
        .reduce((sum, e) => sum + e.hours, 0);
      return { name: p.name, hours, color: p.color };
    }).filter(s => s.hours > 0);
    return stats;
  }, [entries, projects]);

  const dailyStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      stats[e.date] = (stats[e.date] || 0) + e.hours;
    });
    return Object.keys(stats)
      .sort()
      .map(date => ({ date, hours: stats[date] }))
      .slice(-7); // Last 7 days
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
        <p className="text-slate-400">Add some time logs to see your productivity dashboard.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Hours per Project</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {projectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Daily Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="hours"
              >
                {projectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
