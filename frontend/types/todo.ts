export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
}

export interface TodoPayload {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
}
