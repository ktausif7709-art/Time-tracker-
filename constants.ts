
import { Project } from './types';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    color: '#3b82f6',
    tasks: [
      { id: 't1_1', name: 'UI/UX Research' },
      { id: 't1_2', name: 'Frontend Implementation' }
    ]
  },
  {
    id: 'p2',
    name: 'Mobile App Dev',
    color: '#10b981',
    tasks: [
      { id: 't2_1', name: 'API Design' },
      { id: 't2_2', name: 'QA Testing' }
    ]
  }
];

export const STORAGE_KEY = 'chronotrack_entries_v1';
export const PROJECTS_STORAGE_KEY = 'chronotrack_projects_v1';

export const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'
];
