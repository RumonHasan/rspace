import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import {
  AI_CHAT_ID,
  CHECKBOXES_ID,
  CHECKLISTS_ID,
  COMMENTS_ID,
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from '@/config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { z } from 'zod';
import { Workspace } from '../types';
import { Project } from '@/features/projects/types';
import { Task, TaskStatus } from '@/features/tasks/types';
import { Comment } from '@/features/comments/types';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

// work space routes
const app = new Hono()
  // individual workspace
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Get out man' }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })
  // get all workspaces
  .get('/', sessionMiddleware, async (c) => {
    const currentUser = c.get('user');
    const databases = c.get('databases');
    // getting all the members that the current user is part of
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', currentUser.$id),
    ]);
    // if members is 0 then it means this user is not connected or has not created any workspace
    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }
    // creating an workspace id array
    const workspaceIds = members.documents.map((member) => member.workspaceId);
    // getting teh specific workspaces where the user is part of
    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
    );
    return c.json({ data: workspaces });
  })
  // creating a new work space within the collection workspaces
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const storage = c.get('storage');
      // getting form data
      const formData = await c.req.formData();
      const name = formData.get('name') as string;
      const image = formData.get('image') as File;

      // image file processing
      let imageUploadUrl: string | undefined;

      if (image) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );
        // generating file url
        if (file) {
          const arrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id
          );
          imageUploadUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString('base64')}`;
        }
      }
      // creating new work space
      const workspace = await databases.createDocument(
        // work space created
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: imageUploadUrl,
          inviteCode: generateInviteCode(10),
        }
      );
      // creating a new member along with a new workspace
      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({ data: workspace });
    }
  )
  // updating workspace
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { workspaceId } = c.req.param();
      // getting form data
      const formData = await c.req.formData();
      const name = formData.get('name') as string;
      const image = formData.get('image') as File;

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized member' }, 401);
      }

      // image file processing
      let imageUploadUrl: string | undefined;

      if (image) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );
        // generating file url
        if (file) {
          const arrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id
          );
          imageUploadUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString('base64')}`;
        }
      } else {
        imageUploadUrl = undefined;
      }
      // updated workspace
      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          // if image is empty then keep existing image or else uplode new url
          imageUrl: imageUploadUrl,
        }
      );

      return c.json({ data: workspace });
    }
  )
  // resetting invite code
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });
    if (!member || member.role !== MemberRole.ADMIN) {
      // can only be resetted by admin
      return c.json({ error: 'unauthorized' }, 401);
    }
    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(10),
      }
    );
    return c.json({ data: workspace }); // deleted id
  })

  // for adding members to same workspace
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator('json', z.object({ code: z.string() })), // accepts a schema of code object
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid('json');

      const databases = c.get('databases');
      const user = c.get('user');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // if member then no need to add
      if (member) {
        return c.json({ error: 'already a member' }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: 'Invalid Invite Code' }, 400);
      }
      // adding a new member to an existing workspace
      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });
      return c.json({ data: workspace });
    }
  )

  // deleting a particular workspace
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();
    const storage = c.get('storage');

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });
    if (!member || member.role !== MemberRole.ADMIN) {
      // without being an admin cannot delete workspace
      return c.json({ error: 'unauthorized' }, 401);
    }
    // Todo: Delete members, projects and tasks and comments
    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    // deleting all the projects
    const projects = await databases.listDocuments<Project>(
      DATABASE_ID,
      PROJECTS_ID
    );
    await Promise.all(
      projects.documents.map(async (project) => {
        const projectWorkspaceId = project.workspaceId;
        if (projectWorkspaceId === workspaceId) {
          await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, project.$id);
        }
      })
    );
    // deleting all the tasks
    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID);
    await Promise.all(
      tasks.documents.map(async (task) => {
        const taskWorkspaceId = task.workspaceId;
        if (taskWorkspaceId === workspaceId) {
          await databases.deleteDocument(DATABASE_ID, TASKS_ID, task.$id);
        }
      })
    );

    // deletion of associated checklists and checkboxes
    const existingChecklists = await databases.listDocuments(
      DATABASE_ID,
      CHECKLISTS_ID,
      [Query.equal('workspaceId', workspaceId)]
    );
    const existingCheckboxIds: string[] = [];
    // existing checklist ids within a particular task
    const existingChecklistIds = existingChecklists.documents.map(
      (checklist) => checklist.$id
    );
    if (existingChecklistIds.length) {
      await Promise.all(
        existingChecklistIds.map(async (checklistId) => {
          const existingCheckboxes = await databases.listDocuments(
            DATABASE_ID,
            CHECKBOXES_ID,
            [Query.equal('checklistSetId', checklistId)]
          );
          existingCheckboxes.documents.map((checkbox) => {
            const checkboxId = checkbox.$id;
            existingCheckboxIds.push(checkboxId);
          });
          // deleting the checklist
          await databases.deleteDocument(
            DATABASE_ID,
            CHECKLISTS_ID,
            checklistId
          );
        })
      );
    }
    // deleting the checkboxes based on the checklistSetIds
    await Promise.all(
      existingCheckboxIds.map(async (checkboxId) => {
        await databases.deleteDocument(DATABASE_ID, CHECKBOXES_ID, checkboxId);
      })
    );

    // deleting all the related comments
    const comments = await databases.listDocuments<Comment>(
      DATABASE_ID,
      COMMENTS_ID
    );
    await Promise.all(
      comments.documents.map(async (comment) => {
        const commentWorkspaceId = comment.workspaceId;
        const commentImageId = comment.commentImageId;
        if (commentWorkspaceId === workspaceId) {
          await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, comment.$id);
          if (commentImageId !== undefined) {
            await storage.deleteFile(IMAGES_BUCKET_ID, commentImageId);
          }
        }
      })
    );

    // deleting members
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID);
    await Promise.all(
      members.documents.map(async (member) => {
        const memberWorkspaceId = member.workspaceId;
        if (memberWorkspaceId === workspaceId) {
          await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, member.$id);
        }
      })
    );

    // deleting chats from the same work space
    const aiChatsInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      AI_CHAT_ID,
      [Query.equal('workspaceId', workspaceId)]
    );
    await Promise.all(
      aiChatsInWorkspace.documents.map(async (chat) => {
        await databases.deleteDocument(DATABASE_ID, AI_CHAT_ID, chat.$id);
      })
    );

    return c.json({ data: { $id: workspaceId } }); // deleted id
  })

  // getting the workspace analytics
  .get('/:workspaceId/analytics', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    // tasks that are assigned to a different member than original
    const thisMonthAssignedTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const incompleteTasksCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTasksCount - lastMonthIncompleteTasks.total;

    // completed tasks

    const thisMonthCompletedTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    // over due tasks
    const thisMonthOverdueTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverdueTasks = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const overDueTaskCount = thisMonthOverdueTasks.total;
    const overDueTaskDifference =
      overDueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTasksCount,
        incompleteTaskDifference,
        overDueTaskCount,
        overDueTaskDifference,
      },
    });
  });
export default app;
