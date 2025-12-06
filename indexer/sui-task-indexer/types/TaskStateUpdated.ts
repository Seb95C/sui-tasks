export interface TaskStateUpdated {
  project_id: string;
  task_id: string;
  old_state: number;
  new_state: number;
  updated_by: string;
}