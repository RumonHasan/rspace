import { z } from 'zod';

// general notes schema
export const NotesSchema = z.object({
  noteTitle: z.string().min(5, 'Required'),
  workspaceId: z.string().min(10, 'Required'),
  projectId: z.string().optional(),
  note: z.string(),
  noteDescription: z.string().optional(),
});

export type NotesSchema = z.infer<typeof NotesSchema>;
