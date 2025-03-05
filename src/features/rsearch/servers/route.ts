import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { Query, ID } from 'node-appwrite';
import { DATABASE_ID, SEARCH_QUERIES_ID } from '@/config';

// imports for using perplexity api
//import { perplexity } from '@ai-sdk/perplexity';

const app = new Hono()
  // get realtime ai response from SONAR api

  // posting a single query to the database under same workspace
  .post(
    '/',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        workspaceId: z.string(),
        query: z.string(),
      })
    ),
    async (c) => {
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
    }
  )

  // gets some of the queries from previous searches based on workspace Ids
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
          Query.orderAsc('createdAt'),
        ]
      );
      // returning the queries
      return c.json({ data: queries }, 200);
    }
  );

export default app;
