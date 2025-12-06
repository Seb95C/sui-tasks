export interface TaskDueDateUpdated {
  project_id: string;
  task_id: string;
  old_due_date: string;
  new_due_date: string;
  updated_by: string;
}