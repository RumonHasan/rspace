import { z } from 'zod';

export const createChatSchema = z.object({
  message: z.string().trim().min(1, 'Required'),
  workspaceId: z.string().trim().min(1, 'Required'),
  userId: z.string().trim().min(1, 'Required'),
  channelId: z.string().trim().min(1, 'Required'),
  replyTo: z.string().optional(),
});
