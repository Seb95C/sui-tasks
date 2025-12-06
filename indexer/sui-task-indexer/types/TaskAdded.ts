export interface TaskAdded {
  project_id: string;
  task_id: string;
  name: string;
  description: string;
  assignee: string;
  state: number;
  due_date: string;
  added_by: string;
}