
import React, { useState } from 'react';
import { Project, Task } from '../types';
import { Plus, Trash2, Tag, FolderPlus, Check, X } from 'lucide-react';
import { COLOR_PALETTE } from '../constants';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      color: selectedColor,
      tasks: []
    };
    setProjects([...projects, newProj]);
    setNewProjectName('');
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure? This will remove the project from your configuration. Past logs will remain but might look disconnected.')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const addTask = (projectId: string) => {
    if (!newTaskName.trim()) return;
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [...p.tasks, { id: crypto.randomUUID(), name: newTaskName.trim() }]
        };
      }
      return p;
    }));
    setNewTaskName('');
    setAddingTaskTo(null);
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-8">
      {/* Add Project Form */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FolderPlus size={20} className="text-blue-500" />
          Create New Project
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="Project Name (e.g. Freelance Client X)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <div className="flex gap-2 items-center px-2">
            {COLOR_PALETTE.map(color => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-slate-800' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button 
            onClick={addProject}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 justify-center"
          >
            <Plus size={18} /> Add Project
          </button>
        </div>
      </section>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-100" style={{ backgroundColor: `${project.color}10` }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <h4 className="font-bold text-slate-800">{project.name}</h4>
              </div>
              <button 
                onClick={() => deleteProject(project.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Tasks</span>
                <span>{project.tasks.length}</span>
              </div>
              
              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between group p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Tag size={12} className="text-slate-400" />
                      {task.name}
                    </div>
                    <button 
                      onClick={() => deleteTask(project.id, task.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {addingTaskTo === project.id ? (
                <div className="flex gap-2 pt-2">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Task name..."
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask(project.id)}
                  />
                  <button onClick={() => addTask(project.id)} className="text-emerald-500"><Check size={18} /></button>
                  <button onClick={() => setAddingTaskTo(null)} className="text-slate-400"><X size={18} /></button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingTaskTo(project.id)}
                  className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
