import { Models } from 'node-appwrite';

export type Comment = Models.Document & {
  workspaceId: string;
  comment: string;
  taskId: string;
  commentorId: string;
  projectId: string;
  commentImage: string;
  commentImageId: string;
};
