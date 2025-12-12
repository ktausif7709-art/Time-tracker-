
export interface Task {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  date: string; // ISO string YYYY-MM-DD
  hours: number;
  notes: string;
  createdAt: number;
}

export interface AIInsight {
  summary: string;
  tip: string;
  loading: boolean;
}
