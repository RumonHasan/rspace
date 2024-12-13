import { Hono } from 'hono';
import { handle } from 'hono/vercel';
// respective server routes fetched
import authentication from '@/features/auth/servers/route';
import workspaces from '@/features/workspaces/server/route';
import members from '@/features/members/server/route';
import projects from '@/features/projects/server/route';
import tasks from '@/features/tasks/server/route';
import ai from '@/features/ai/servers/route';
import comments from '@/features/comments/server/route';
import channels from '@/features/channels/server/route';
import chats from '@/features/chats/server/route';

const app = new Hono().basePath('/api');

// will contain all the auth routes here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route('/auth', authentication) // authenticaion routes
  .route('/workspaces', workspaces) // workspaces route
  .route('/members', members)
  .route('/projects', projects)
  .route('/tasks', tasks)
  .route('/ai', ai)
  .route('/comments', comments)
  .route('/discussions', channels)
  .route('/chats', chats);

// redirecting to hono -- adding all the CRUD paths handler
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
