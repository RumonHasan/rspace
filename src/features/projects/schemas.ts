import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  imageUrl: z
    .union([
      z.any(), // For File objects from FormData
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Minimum 1 character required').optional(),
  imageUrl: z
    .union([
      z.any(), // For File objects from FormData
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});
