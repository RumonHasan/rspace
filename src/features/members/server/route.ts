import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { getMember } from '../utils';
import { DATABASE_ID, MEMBERS_ID } from '@/config';
import { Query } from 'node-appwrite';
import { Member, MemberRole } from '../types';

const app = new Hono()
  // getting all the members of the same workspace
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient(); // all users
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId } = c.req.valid('query');

      // have to check whether current user is a member or not
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // returns the number of members that have the same workspace id
      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', workspaceId)]
      );

      // returns an array of all the members within the same workspace including their name and email
      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
            role: member.role,
          };
        })
      );

      return c.json({
        data: {
          ...members,
          documents: populatedMembers,
        },
      });
    }
  )
  // deleting a particular member from the workspace
  .delete('/:memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');

    // member you want to delete
    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      // all members in the current member to delete workspace
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal('workspaceId', memberToDelete.workspaceId)]
    );

    // if its only one member part of a single workspace then cannot delete member
    if (allMembersInWorkspace.total === 1) {
      return c.json({
        error: 'Cannot delete the only member of the workspace',
      });
    }
    // currently logged in user
    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' });
    }
    // if current one user is member and admin at the same time then cannot remove
    // this setting allows u to remove onself and change status
    if (
      member.$id == memberToDelete.$id &&
      memberToDelete.role == MemberRole.ADMIN
    ) {
      return c.json({ error: 'You are not authorized ' }, 401);
    }

    // deleting the member if all the conditions check out
    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  })

  // updating a member role
  .patch(
    '/:memberId',
    sessionMiddleware,
    zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get('user');
      const databases = c.get('databases');
      const { role } = c.req.valid('json');

      // member you want to update
      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        // all members in the current member to delete workspace
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', memberToUpdate.workspaceId)]
      );

      // if its only one member part of a single workspace then cannot delete member
      if (allMembersInWorkspace.total === 1) {
        return c.json({
          error: 'Cannot delete the only member of the workspace',
        });
      }
      // currently logged in user
      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' });
      }
      // only admin can update the status of any member
      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'You are not authorized ' }, 401);
      }
      // updating the member role
      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  );
export default app;
