import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  image: z
    .union([
      z.any(), // For File objects from FormData
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});

// for updating workspace details
export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Required').optional(),
  image: z
    .union([
      z.any(), // For File objects from FormData
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});
