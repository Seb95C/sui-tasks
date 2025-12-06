/**
 * Task types mapped to the jira_engine Move package.
 */

export enum TaskState {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

export interface Subtask {
  id: string;
  taskId: string;
  subtaskId: string;
  name: string;
  description: string;
  state: number;
}

export interface Attachment {
  id: string;
  taskId: string;
  attachmentId: string;
  name: string;
  url: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignee: string;
  state: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  attachments: Attachment[];
}
