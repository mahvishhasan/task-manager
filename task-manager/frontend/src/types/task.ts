export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface Task {
  _id?: string;   // Mongo
  id?: string;    // fallback (if you ever map it)
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  _id?: string;
  id?: string;
}
