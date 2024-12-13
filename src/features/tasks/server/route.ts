import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createTaskSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import {
  COMMENTS_ID,
  DATABASE_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  IMAGES_BUCKET_ID,
} from '@/config';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { Task, TaskStatus } from '../types';
import { createAdminClient } from '@/lib/appwrite';
import { Project } from '@/features/projects/types';
import { Comment } from '@/features/comments/types';
import { Member } from '@/features/members/types';

const app = new Hono()

  .delete('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { taskId } = c.req.param();
    const storage = c.get('storage');

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );
    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    // if member is found then delete task from workspace Id
    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);
    // deleting all the task comments if task is deleted
    const comments = await databases.listDocuments<Comment>(
      DATABASE_ID,
      COMMENTS_ID
    );
    // deleting the comments that are matching the current task I
    if (comments.documents.length) {
      await Promise.all(
        comments.documents.map(async (comment) => {
          const commentTaskId = comment.taskId;
          const commentImageId = comment.commentImageId;
          if (commentTaskId === taskId) {
            await databases.deleteDocument(
              DATABASE_ID,
              COMMENTS_ID,
              comment.$id
            );
            // deleting the associated comment images also
            if (commentImageId !== undefined) {
              await storage.deleteFile(IMAGES_BUCKET_ID, commentImageId);
            }
          }
        })
      );
    }

    return c.json({ data: { $id: task.$id } });
  })

  // updating a certain task based on the project and task id
  .patch(
    '/:taskId',
    sessionMiddleware,
    zValidator('json', createTaskSchema.partial()),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { name, status, projectId, dueDate, assigneeId, description } =
        c.req.valid('json');

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'unauthorized' }, 401);
      }

      // only updating the values like project id and status etc....
      // NOte the workspace id remains the same
      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        }
      );

      return c.json({ data: task });
    }
  )

  // getting an individual task based on id
  .get('/:taskId', sessionMiddleware, async (c) => {
    const currentUser = c.get('user');
    const databases = c.get('databases');
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const assignedProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId); // getting user detail

    const assignee = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: {
        ...task,
        project: assignedProject,
        assignee: assignee,
      },
    });
  })
  // getting tasks specifically for search bar only based on workspaceId
  .get(
    '/search-bar/tasks',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // getting all the tasks based on workspaceId including their assignee details
      const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
        Query.equal('workspaceId', workspaceId),
      ]);

      // now extract the assignee ids to get the member user id details
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
      );
      // so gets the particular member and finds its user details
      const populatedTasks = await Promise.all(
        tasks?.documents.map(async (task) => {
          const taskMember = members.documents.find(
            (m) => m.$id === task.assigneeId
          );
          if (taskMember) {
            const assignee = await users.get(taskMember.userId);
            return {
              ...task,
              assigneeName: assignee.name,
              assigneeEmail: assignee.email,
            };
          }
        })
      );

      return c.json({
        data: {
          total: tasks.documents.length ?? 0,
          documents: populatedTasks ?? [],
        },
      });
    }
  )

  // getting all the tasks here with populated details of their assignee and project
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
        projectIdPresentInTask: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');

      const {
        workspaceId,
        projectId,
        assigneeId,
        status,
        search,
        dueDate,
        projectIdPresentInTask,
      } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // task query for getting the tasks based on current workspace, project and assignee
      const query = [
        Query.equal('workspaceId', workspaceId), // all the tasks belonging to the particular use workspace id
        Query.orderDesc('$createdAt'),
      ];
      if (projectIdPresentInTask) {
        // if a single project is clicked and u want to pass that single project Id
        query.push(Query.equal('projectId', projectIdPresentInTask));
      }
      if (projectId) {
        query.push(Query.equal('projectId', projectId));
      }
      if (status) {
        query.push(Query.equal('status', status));
      }
      if (assigneeId) {
        query.push(Query.equal('assigneeId', assigneeId));
      }
      if (search) {
        query.push(Query.equal('search', search));
      }
      if (dueDate) {
        query.push(Query.equal('dueDate', dueDate));
      }

      // getting all the tasks based on the above query
      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );
      // getting project ids and assignees id
      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      // gets all the related projects
      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains('$id', projectIds)] : []
      );

      //gets all the related members
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
      );
      // getting all the related assignee data informations
      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        })
      );
      // assigning each tasks with the assignee and project details belonging to that particular task
      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );
        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );
        // returns the final task object with its connected assignee and project Id
        return {
          ...task,
          project,
          assignee,
        };
      });

      // returning the populated tasks
      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks ?? [],
        },
      });
    }
  )

  // making a new task based on the passed down value
  .post(
    '/',
    sessionMiddleware,
    zValidator('json', createTaskSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        description,
      } = c.req.valid('json');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'unauthorized' }, 401);
      }

      const highestPositionTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal('status', status),
          Query.equal('workspaceId', workspaceId),
          Query.orderDesc('position'), // gets the highest position thena adds a 1000
          Query.limit(1),
        ]
      );

      const newPosition = // adds a 1000 to an existing position
        highestPositionTasks.documents.length > 0
          ? highestPositionTasks.documents[0].position + 1000
          : 1000;

      const newTask = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition,
          description,
        }
      );

      return c.json({ data: newTask });
    }
  )

  // bulk update
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get('databases');
      const { tasks } = c.req.valid('json');
      const user = c.get('user');

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            '$id',
            tasks.map((task) => task.$id)
          ),
        ]
      );
      // can only be updated inside a single workspace in order for bulk update
      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          { error: 'All Tasks Must Belong To The Same Workspace' },
          401
        );
      }

      const workspaceId = Array.from(workspaceIds)[0];
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updatedTask = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTask });
    }
  );
export default app;
