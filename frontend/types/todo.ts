export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface TodoPayload {
  title: string;
  description?: string;
  completed?: boolean;
}
