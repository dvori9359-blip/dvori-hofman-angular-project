export interface Task {
  id?: string;
  _id?: string; 
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority?: 'High' | 'Medium' | 'Low';
  assignee_id?: string;
  project_id?: string;
  created_at?: string;
}

export interface Comment {
  id?: string;
  _id?: string;
  task_id: string;
  author_name?: string;
  body: string;
  created_at?: string;
}