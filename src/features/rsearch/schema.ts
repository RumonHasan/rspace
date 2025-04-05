import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().default(''),
  workspaceId: z.string(),
});

// for ui
export const AiChatSchema = z.object({
  id: z.string(),
  query: z.string(),
  workspaceId: z.string(),
  isHuman: z.boolean(),
  userId: z.string(),
  response: z.string(),
  chatContextId: z.string(),
});

export const AiChatSchemaDatabase = z.object({
  // Appwrite system fields
  $id: z.string(),
  $collectionId: z.string(),
  $databaseId: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  $permissions: z.array(z.string()),

  // Your existing fields
  query: z.string(),
  workspaceId: z.string(),
  isHuman: z.boolean(),
  userId: z.string(),
  response: z.string(),
  chatContextId: z.string(),
});

// Derive the TypeScript type from the Zod schema
export type AiChat = z.infer<typeof AiChatSchema>;
