/**
 * Permission helpers for project/task actions.
 */

import { Project } from '@/types/project';
import { ProjectMember } from '@/types/user';
import { Task } from '@/types/task';

const normalize = (value?: string) => value?.trim().toLowerCase();

export function isProjectMember(
  members: ProjectMember[] = [],
  userAddress?: string,
): boolean {
  const target = normalize(userAddress);
  if (!target) return false;
  return members.some((m) => normalize(m.address) === target);
}

export function isProjectManager(
  project: Project | null,
  userAddress?: string,
): boolean {
  if (!project) return false;
  return normalize(project.manager) === normalize(userAddress);
}

export function canManageMembers(
  project: Project | null,
  userAddress?: string,
): boolean {
  return isProjectManager(project, userAddress);
}

export function canEditTask(
  project: Project | null,
  task: Task | null,
  userAddress?: string,
): boolean {
  if (!task || !userAddress) return false;
  if (isProjectManager(project, userAddress)) return true;
  return normalize(task.assignee) === normalize(userAddress);
}

export function canCreateTask(
  project: Project | null,
  members: ProjectMember[],
  userAddress?: string,
): boolean {
  return isProjectManager(project, userAddress) || isProjectMember(members, userAddress);
}
