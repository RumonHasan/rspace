import { z } from 'zod';

export const createChecklistSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  taskId: z.string().trim().min(1, 'Required'),
  projectId: z.string().trim().min(1, 'Required'),
  text: z.string().trim().min(1, 'Required'),
  isCompleted: z.boolean().default(false),
  list: z
    .array(
      z.object({
        checklistSetId: z.string().trim().min(1, 'Required'),
        checkboxText: z.string().trim().min(1, 'Required'),
        isCheckboxCompleted: z.boolean().default(false),
      })
    )
    .optional(),
});
