import { CHATS_ID, DATABASE_ID } from '@/config';
import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { ID, Query } from 'node-appwrite';
import { Chat } from '../types';
import { createChatSchema } from '../schemas';

const app = new Hono()

  // getting a single message based on message id
  .post(
    '/get-message',
    sessionMiddleware,
    zValidator('json', z.object({ messageId: z.string() })),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { messageId } = c.req.valid('json');
      // existing message
      const existingMessage = await databases.getDocument(
        DATABASE_ID,
        CHATS_ID,
        messageId
      );

      const member = await getMember({
        databases,
        workspaceId: existingMessage.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      return c.json({ data: existingMessage }, 200);
    }
  )

  // getting all the chats from a particular channel
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({ workspaceId: z.string(), channelId: z.string() })
    ),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId, channelId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const messages = await databases.listDocuments<Chat>(
        DATABASE_ID,
        CHATS_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.equal('channelId', channelId),
          Query.orderAsc('$createdAt'),
        ]
      );

      return c.json({ data: messages });
    }
  )

  // post a message
  .post(
    '/create-message',
    sessionMiddleware,
    zValidator('form', createChatSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const formData = await c.req.formData();

      const workspaceId = formData.get('workspaceId') as string;
      const channelId = formData.get('channelId') as string;
      const message = formData.get('message') as string;
      const replyTo = formData.get('replyTo') as string;
      const userId = formData.get('userId') as string;

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // creating a message payload
      const payload = {
        message: message,
        workspaceId,
        channelId,
        userId,
        replyTo,
      };
      const newMessage = await databases.createDocument(
        DATABASE_ID,
        CHATS_ID,
        ID.unique(),
        payload
      );

      return c.json({ data: newMessage });
    }
  );

export default app;
