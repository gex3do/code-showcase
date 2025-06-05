import {TaskWidget} from '../widgets';

export enum TaskPriority {
  NO = -2,
  LOW = -1,
  MEDIUM = 0,
  HIGH = 1,
  URGENT = 2,
}

export enum TaskStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Task {
  id: number;
  title: string;
  assignee?: string;
  count: number;
  priority: TaskPriority;
  escalated: boolean;
  status: TaskStatus;
  created: number;
  payload?: {
    bgColor?: string;
    data: object;
    widgets: TaskWidget[];
  };
  tripwireId?: string;
}
