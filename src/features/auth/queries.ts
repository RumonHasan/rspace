'use server';
import { createSessionClient } from '@/lib/appwrite';

// getting current user from server component to prevent using use effect
export const getCurrent = async () => {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
};
