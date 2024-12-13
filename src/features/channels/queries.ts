import { CHANNELS_ID, DATABASE_ID } from '@/config';
import { createSessionClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';
import { Channel } from './types';
import { getMember } from '../members/utils';

interface GetChannelProps {
  workspaceId: string;
}
// server side for getting channels in a partricular workspace
export const getChannels = async ({ workspaceId }: GetChannelProps) => {
  try {
    const { databases, account } = await createSessionClient();
    const currentUser = await account.get();
    // fetching the respective workspaces based on members
    const member = await getMember({
      databases,
      workspaceId,
      userId: currentUser.$id,
    });

    if (!member) {
      return null;
    }
    // getting the channels that the user is part of
    const channels = await databases.listDocuments<Channel>(
      DATABASE_ID,
      CHANNELS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.search('membersId', currentUser.$id),
      ]
    );

    return channels;
  } catch {
    return { documents: [], total: 0 };
  }
};
