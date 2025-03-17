import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { Query, ID } from 'node-appwrite';
import { AI_CHAT_ID, DATABASE_ID, SEARCH_QUERIES_ID } from '@/config';
import { searchSchema } from '../schema';
import { generateSonarResponse } from '../utils/perplexity';

const app = new Hono()
  // get all the sonar responses under same workspace
  .get(
    '/ai-chats',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({ workspaceId: z.string(), limit: z.coerce.number().optional() })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId, limit } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // if its not a member then unauthorize
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // fetch the sonar response chat filtering via current workspaceId
      const queries = [
        Query.equal('workspaceId', workspaceId),
        Query.orderDesc('$createdAt'),
      ];
      if (limit) {
        queries.push(Query.limit(limit));
        queries.push(Query.equal('isHuman', false));
      }
      const fetchedAiChats = await databases.listDocuments(
        DATABASE_ID,
        AI_CHAT_ID,
        queries
      );
      // fetching the ai chats
      return c.json({ data: fetchedAiChats });
    }
  )

  // getting ai chat responses based on chatContextId under same workspace
  .get(
    '/sonar-response/chat-context',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({ workspaceId: z.string(), chatContextId: z.string() })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { chatContextId, workspaceId } = c.req.valid('query');

      const member = await getMember({
        workspaceId,
        databases,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // ai chats based on the chat context id
      const aiChatsBasedOnChatContext = await databases.listDocuments(
        DATABASE_ID,
        AI_CHAT_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.equal('chatContextId', chatContextId),
          Query.orderDesc('$createdAt'), // sorting based on created timestamps
        ]
      );

      return c.json({ data: aiChatsBasedOnChatContext }, 200);
    }
  )

  // post and get response into existing chat context id
  .post(
    '/sonar-response/chat-context',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        workspaceId: z.string(),
        chatContextId: z.string(),
        query: z.string(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId, chatContextId, query } = c.req.valid('json');

      const member = await getMember({
        workspaceId,
        databases,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const sonarResponse = await generateSonarResponse(query, 'markdown');
      // passing the same context id when creating new query
      const newAiChatHuman = await databases.createDocument(
        DATABASE_ID,
        AI_CHAT_ID,
        ID.unique(),
        {
          workspaceId,
          query,
          response: null,
          isHuman: true,
          userId: user.$id,
          chatContextId: chatContextId,
        }
      );
      // adding the sonar response for ai portion of the response
      const newAiChatResponse = await databases.createDocument(
        DATABASE_ID,
        AI_CHAT_ID,
        ID.unique(),
        {
          workspaceId,
          query,
          response: sonarResponse,
          isHuman: false,
          userId: user.$id,
          chatContextId: chatContextId,
        }
      );

      return c.json({
        data: {
          query: newAiChatHuman,
          response: newAiChatResponse,
        },
      });
    }
  )

  // posting a single sonar response in rinput... the initial query
  .post(
    '/sonar-response',
    sessionMiddleware,
    zValidator('json', searchSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId, query } = c.req.valid('json');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // cannot fetch ai response
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const sonarResponse = await generateSonarResponse(query, 'markdown');
      const newChatContextId = ID.unique(); // to create a new chat context id when the intial input is clicked
      // adding chat as a human query first
      const newAiChatHuman = await databases.createDocument(
        DATABASE_ID,
        AI_CHAT_ID,
        ID.unique(),
        {
          workspaceId,
          query,
          response: null,
          isHuman: true,
          userId: user.$id,
          chatContextId: newChatContextId,
        }
      );
      // adding the sonar response for ai portion of the response
      const newAiChatResponse = await databases.createDocument(
        DATABASE_ID,
        AI_CHAT_ID,
        ID.unique(),
        {
          workspaceId,
          query,
          response: sonarResponse,
          isHuman: false,
          userId: user.$id,
          chatContextId: newChatContextId,
        }
      );

      return c.json(
        {
          data: {
            query: newAiChatHuman,
            response: newAiChatResponse,
          },
        },
        200
      );
    }
  )

  // posting a single query to the database under same workspace
  .post('/', sessionMiddleware, zValidator('json', searchSchema), async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { workspaceId, query } = c.req.valid('json');
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });
    // cannot fetch queries if unauthorized
    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const newQuery = await databases.createDocument(
      DATABASE_ID,
      SEARCH_QUERIES_ID,
      ID.unique(),
      {
        workspaceId,
        query,
      }
    );

    return c.json({ data: newQuery }, 200);
  })

  // getting the recent search queries within the same workspace
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId } = c.req.valid('query');
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // cannot fetch queries if unauthorized
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // returning the queries with limit of 7 under same workspaceid
      const queries = await databases.listDocuments(
        DATABASE_ID,
        SEARCH_QUERIES_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.limit(6),
          Query.orderDesc('$createdAt'),
        ]
      );
      // returning the queries
      return c.json({ data: queries }, 200);
    }
  );

export default app;
