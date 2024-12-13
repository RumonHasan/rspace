import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from '../schemas';
import { createAdminClient } from '@/lib/appwrite';
import { deleteCookie, setCookie } from 'hono/cookie';
import { ID } from 'node-appwrite';
import { AUTH_COOKIE } from '../constants/constants';
import { sessionMiddleware } from '@/lib/session-middleware';
// note z validator is the middleware

const app = new Hono()
  // getting the current user to use for logout and other routes
  .get('/current', sessionMiddleware, (c) => {
    const user = c.get('user');
    return c.json({ data: user });
  })
  // login
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    // using cookies from hono
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ email, password });
  })
  // registration
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, password } = c.req.valid('json');
    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name); // creating the account
    const session = await account.createEmailPasswordSession(email, password);
    // using cookies from hono
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  // logging out of the user
  .post('/logout', sessionMiddleware, async (c) => {
    const account = c.get('account');
    // so when logging out the middleware makes sure that the account sessions including its database and ids are logged out
    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession('current');
    return c.json({ success: true });
  });

export default app;
