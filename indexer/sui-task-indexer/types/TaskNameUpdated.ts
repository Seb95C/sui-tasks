export interface TaskNameUpdated {
  project_id: string;
  task_id: string;
  old_name: string;
  new_name: string;
  updated_by: string;
}