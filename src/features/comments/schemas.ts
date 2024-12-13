import { z } from 'zod';

export const createCommentSchema = z
  .object({
    workspaceId: z.string().trim().min(1, 'Required'),
    comment: z.string().optional(),
    taskId: z.string().trim().min(1, 'Required'),
    projectId: z.string().trim().min(1, 'Required'),
    commentorId: z.string().trim().min(1, 'Required'),
    // optional comment image added... either comment image or text will be displayed
    commentImage: z
      .union([
        z.any(), // For File objects from FormData
        z.string().transform((value) => (value === '' ? undefined : value)),
      ])
      .optional(),
    commentImageId: z.string().optional(),
  })
  // making sure either comment or image has to be provided
  .refine((data) => data.comment || data.commentImage, {
    message: 'Either comment or comment image must be provided',
    path: ['comment'], // path to the fiel that has created the error
  });
