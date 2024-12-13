import 'server-only';
import { Client, Account, Databases, Users } from 'node-appwrite';
import { AUTH_COOKIE } from '@/features/auth/constants/constants';
import { cookies } from 'next/headers';

// creating custom session client.. note cookies here are from next headers
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get(AUTH_COOKIE);

  if (!session || !session.value) {
    throw new Error('Unauthorized');
  }
  client.setSession(session.value);
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

// this is an admin client.. used when an admin needs to create something
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
