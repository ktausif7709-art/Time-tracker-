
import React, { useState, useEffect, useRef } from 'react';
import { Project, TimeEntry, AIInsight } from './types';
import { DEFAULT_PROJECTS, STORAGE_KEY, PROJECTS_STORAGE_KEY } from './constants';
import { TimeEntryCard } from './components/TimeEntryCard';
import { StatsDashboard } from './components/StatsDashboard';
import { ProjectManager } from './components/ProjectManager';
import { getProductivityInsights } from './services/geminiService';
import { 
  Plus, 
  LayoutDashboard, 
  History, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
  Play,
  Pause,
  RotateCcw,
  Save,
  Clock,
  Settings
} from 'lucide-react';

const formatHoursMinutes = (decimalHours: number) => {
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${m}m`;
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'log' | 'dashboard' | 'manage'>('log');
  const [aiInsight, setAiInsight] = useState<AIInsight>({ summary: '', tip: '', loading: false });

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Initial Load
  useEffect(() => {
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    
    if (savedEntries) {
      try { setEntries(JSON.parse(savedEntries)); } catch (e) { console.error(e); }
    }
    
    if (savedProjects) {
      try { setProjects(JSON.parse(savedProjects)); } catch (e) { console.error(e); }
    } else {
      setProjects(DEFAULT_PROJECTS);
    }
  }, []);

  // Sync back to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAddEntry = (e?: React.FormEvent, overrideHours?: number) => {
    if (e) e.preventDefault();
    
    const finalHours = overrideHours !== undefined ? overrideHours : parseFloat(hours);
    
    if (!selectedProjectId || !selectedTaskId || isNaN(finalHours) || !date) {
      alert("Please select a project, task, and ensure duration is valid.");
      return;
    }

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      hours: parseFloat(finalHours.toFixed(4)), // Keep precision for storage
      date,
      notes,
      createdAt: Date.now()
    };

    setEntries(prev => [newEntry, ...prev]);
    setHours('');
    setNotes('');
    
    if (overrideHours !== undefined) {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  };

  const handleLogTimer = () => {
    if (timerSeconds < 10) {
      alert("Session too short to log! (Min 10s)");
      return;
    }
    const decimalHours = timerSeconds / 3600;
    handleAddEntry(undefined, decimalHours);
  };

  const generateAIInsights = async () => {
    if (entries.length < 2) {
      alert("Log at least 2 entries for AI analysis!");
      return;
    }
    setAiInsight(prev => ({ ...prev, loading: true }));
    const result = await getProductivityInsights(entries, projects);
    setAiInsight({ ...result, loading: false });
  };

  const totalDecimalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Clock size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ChronoTrack Pro
            </h1>
          </div>
          
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'log', label: 'Log Time', icon: Clock },
              { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
              { id: 'manage', label: 'Manage', icon: Settings }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'manage' ? (
              <ProjectManager projects={projects} setProjects={setProjects} />
            ) : activeTab === 'log' ? (
              <>
                {/* Timer Widget */}
                <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative border border-slate-800">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 justify-center md:justify-start">
                        {isTimerRunning && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                        {isTimerRunning ? 'Active Recording' : 'Ready to Start'}
                      </p>
                      <h2 className="text-5xl font-mono font-black tracking-tighter">
                        {formatTimer(timerSeconds)}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isTimerRunning ? 'bg-amber-500' : 'bg-emerald-500'} shadow-lg`}
                      >
                        {isTimerRunning ? <Pause fill="white" size={24} /> : <Play fill="white" className="ml-1" size={24} />}
                      </button>
                      <button onClick={() => setTimerSeconds(0)} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700"><RotateCcw size={20} /></button>
                      <button onClick={handleLogTimer} disabled={timerSeconds < 10} className="h-12 px-6 rounded-full bg-blue-600 disabled:opacity-50 font-bold text-sm flex items-center gap-2"><Save size={18} /> Log</button>
                    </div>
                  </div>
                </section>

                {/* Form */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <form onSubmit={handleAddEntry} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
                          value={selectedProjectId}
                          onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedTaskId(''); }}
                          required
                        >
                          <option value="">Choose Project</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Task</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 disabled:opacity-50"
                          value={selectedTaskId}
                          onChange={(e) => setSelectedTaskId(e.target.value)}
                          disabled={!selectedProjectId}
                          required
                        >
                          <option value="">Choose Task</option>
                          {selectedProject?.tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" required />
                      <div className="relative">
                        <input type="number" step="0.25" placeholder="Manual Hours (e.g. 1.5)" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                        {hours && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                             = {formatHoursMinutes(parseFloat(hours))}
                          </div>
                        )}
                      </div>
                    </div>
                    <textarea placeholder="Work details..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" rows={2} />
                    <button type="submit" disabled={!hours} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                      <Plus size={20} /> Log Hours
                    </button>
                  </form>
                </section>

                <section className="space-y-4">
                  {entries.map(entry => (
                    <TimeEntryCard 
                      key={entry.id} 
                      entry={entry} 
                      project={projects.find(p => p.id === entry.projectId)}
                      onDelete={(id) => setEntries(prev => prev.filter(e => e.id !== id))}
                    />
                  ))}
                  {entries.length === 0 && <div className="text-center py-12 text-slate-400">No activity yet.</div>}
                </section>
              </>
            ) : (
              <section className="space-y-8">
                <StatsDashboard entries={entries} projects={projects} />
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2"><Sparkles size={20} /><h3 className="text-xl font-bold">AI Productivity Insights</h3></div>
                      <button onClick={generateAIInsights} disabled={aiInsight.loading} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm">
                        {aiInsight.loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Insights'}
                      </button>
                    </div>
                    {aiInsight.summary && (
                      <div className="space-y-4">
                        <p className="text-lg leading-relaxed">{aiInsight.summary}</p>
                        <p className="text-indigo-200 font-medium italic">Tip: {aiInsight.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Total Logged</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-600">
                  {totalDecimalHours > 0 ? formatHoursMinutes(totalDecimalHours) : "0m"}
                </span>
              </div>
              {totalDecimalHours > 0 && (
                <p className="text-[10px] text-slate-400 mt-1 font-medium">({totalDecimalHours.toFixed(2)} decimal hours)</p>
              )}
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Projects</h3>
                <button onClick={() => setActiveTab('manage')} className="text-blue-400 hover:text-blue-300 transition-colors"><Plus size={18} /></button>
              </div>
              <div className="space-y-2">
                {projects.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { setSelectedProjectId(p.id); setActiveTab('log'); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedProjectId === p.id ? 'bg-blue-600/20 ring-1 ring-blue-500/50' : 'hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{p.tasks.length} tasks</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 z-30 flex justify-around shadow-2xl">
        <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center gap-1 ${activeTab === 'log' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Clock size={24} /><span className="text-[10px] font-bold">LOG</span>
        </button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} /><span className="text-[10px] font-bold">STATS</span>
        </button>
        <button onClick={() => setActiveTab('manage')} className={`flex flex-col items-center gap-1 ${activeTab === 'manage' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Settings size={24} /><span className="text-[10px] font-bold">MANAGE</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
