export interface TaskAssigneeUpdated {
  project_id: string;
  task_id: string;
  old_assignee: string;
  new_assignee: string;
  updated_by: string;
}