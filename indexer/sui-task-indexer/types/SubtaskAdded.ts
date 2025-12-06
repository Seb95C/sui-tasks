export interface SubtaskAdded {
  project_id: string;
  task_id: string;
  subtask_id: string;
  name: string;
  description: string;
  state: number;
  added_by: string;
}