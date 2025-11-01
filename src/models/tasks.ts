export type Task = {
  id: string;
  title: string;
  priority: number;
  completed: boolean;
  created_at: string; // ISO timestamp
  due_date: string;
};
