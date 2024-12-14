import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createChannelSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import { CHANNELS_ID, CHATS_ID, DATABASE_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { Channel } from '../types';
import { createAdminClient } from '@/lib/appwrite';

const app = new Hono()

  // deleting a channel along with all its messages
  .delete('/:channelId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { channelId } = c.req.param();
    // First get the actual channel document
    const channel = await databases.getDocument(
      DATABASE_ID,
      CHANNELS_ID,
      channelId // This should be the document ID
    );
    if (!channel) {
      return c.json({ error: 'Channel not found' }, 404);
    }
    const member = await getMember({
      databases,
      workspaceId: channel.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Delete channel
    const deletedChannel = await databases.deleteDocument(
      DATABASE_ID,
      CHANNELS_ID,
      channelId
    );

    // Delete associated messages
    const chatsInChannel = await databases.listDocuments(
      DATABASE_ID,
      CHATS_ID,
      [Query.equal('channelId', channelId)]
    );
    const chatIds = chatsInChannel?.documents.map((chat) => chat.$id);
    // deleting associated messages
    await Promise.all(
      chatIds.map(async (chatId) => {
        await databases.deleteDocument(DATABASE_ID, CHATS_ID, chatId);
      })
    );

    return c.json({ data: deletedChannel });
  })

  // creating a new channel
  .post(
    '/create-channel',
    sessionMiddleware,
    zValidator('json', createChannelSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId, name, membersId, description } = c.req.valid('json');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'unauthorized' }, 401);
      }

      const chatMembers = [...membersId, user.$id];
      const channelIdentifier = chatMembers.sort().join('');
      // check for existing channel
      const existingChannel = await databases.listDocuments(
        DATABASE_ID,
        CHANNELS_ID,
        [Query.equal('identifier', channelIdentifier)]
      );

      if (existingChannel.documents.length > 0) {
        return c.json({ error: 'Channel already exists' }, 401);
      }

      // creating a new channel
      const newChannel = await databases.createDocument(
        DATABASE_ID,
        CHANNELS_ID,
        ID.unique(),
        {
          workspaceId,
          name,
          description,
          membersId: chatMembers,
          identifier: channelIdentifier,
        }
      );

      return c.json({ data: newChannel });
    }
  )

  // getting the all channels
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { users } = await createAdminClient();

      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'unauthorized' }, 401);
      }
      // getting the channels that the user is part of
      const channels = await databases.listDocuments<Channel>(
        DATABASE_ID,
        CHANNELS_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.search('membersId', user.$id),
        ]
      );

      const mappedChannels = channels.documents.map((channel) => channel);

      // repopulate the existing membersId into its own set of name and email objects for user details
      const populatedChannels = await Promise.all(
        mappedChannels.map(async (channel) => {
          const membersIds = channel.membersId;
          const membersCollection = await Promise.all(
            membersIds.map(async (memberId) => {
              const member = await users.get(memberId);
              return {
                memberId,
                name: member.name,
                email: member.email,
              };
            })
          );
          return {
            ...channel,
            membersId: membersCollection,
          };
        })
      );

      return c.json({
        data: {
          documents: populatedChannels,
          total: populatedChannels.length,
        },
      });
    }
  );

export default app;
