/**
 * Project types aligned with the jira_engine Move package.
 */

import { Task } from './task';
import { ProjectMember } from './user';

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  createdAt: string;
  updatedAt: string;
  managerCapId?: string;
  members: ProjectMember[];
  tasks: Task[];
}

export interface ProjectStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  membersCount: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  displayName: string;
}
