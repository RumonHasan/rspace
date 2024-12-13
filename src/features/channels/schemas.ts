import { z } from 'zod';

export const createChannelSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  name: z.string().optional(),
  membersId: z.array(z.string().trim().min(1, 'Required')),
  description: z.string().optional(),
  identifier: z.string().optional(),
});
