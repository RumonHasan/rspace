import { Models } from 'node-appwrite';

// types from appwrite database
export type Checklist = Models.Document & {
  workspaceId: string;
  taskId: string;
  projectId: string;
  text: string;
  isCompleted: boolean;
};

export type Checkbox = Models.Document & {
  checklistSetId: string;
  checkboxText: string;
  isCheckboxCompleted: boolean;
};

// types only for the ui
export interface ChecklistUI {
  checklistId: string;
  checklistName: string;
  list: CheckboxUI[];
}

export interface CheckboxUI {
  checklistSetId: string;
  checkboxId: string;
  checkboxText: string;
  isCheckboxCompleted: boolean;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
}

// progress types for checklist progress
export interface ChecklistProgressRecord {
  [checklistId: string]: ChecklistProgress;
}

// Alternative syntax using Record type
export type ChecklistProgressMap = Record<string, ChecklistProgress>;
