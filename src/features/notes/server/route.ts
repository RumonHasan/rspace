import { sessionMiddleware } from '@/lib/session-middleware';
import { Hono } from 'hono';

const app = new Hono()

  // get all notes within the same workspace
  .get('/', sessionMiddleware);

export default app;
