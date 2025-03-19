import { z } from 'zod';

export const notesSchema = z.object({
  name: z.string().min(5, 'Required'),
  workspaceId: z.string().min(10, 'Required'),
  projectId: z.string().optional(),
  note: z.string(),
});
