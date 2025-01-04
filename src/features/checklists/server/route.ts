import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createChecklistSchema, updateChecklistSchema } from '../schema';
import { getMember } from '@/features/members/utils';
import { CHECKBOXES_ID, CHECKLISTS_ID, DATABASE_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { Checkbox, Checklist } from '../types';

const app = new Hono()

  // getting checklists belonging to a particular task
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        taskId: z.string(),
      })
    ),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { taskId, workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // gets the checklist from that particular task
      const checklists = await databases.listDocuments<Checklist>(
        DATABASE_ID,
        CHECKLISTS_ID,
        [Query.equal('taskId', taskId), Query.equal('workspaceId', workspaceId)]
      );
      // getting all the populated checkboxes belonging to a particular checklist
      const populatedChecklists = await Promise.all(
        checklists.documents.map(async (checklist) => {
          const checkboxes = await databases.listDocuments(
            DATABASE_ID,
            CHECKBOXES_ID,
            [Query.equal('checklistSetId', checklist.$id)]
          );
          return {
            ...checklist,
            list: checkboxes.documents,
          };
        })
      );

      return c.json({ data: populatedChecklists });
    }
  )

  // updating checklists
// single patch checklist update
  .patch(
    '/:checklistId',
    sessionMiddleware,
    zValidator('json', updateChecklistSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { checklistId } = c.req.param();

      const { workspaceId, projectId, taskId, text, isCompleted, list } =
        c.req.valid('json');


      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updatedChecklist = await databases.updateDocument(
        DATABASE_ID,
        CHECKLISTS_ID,
        checklistId,
        {
          workspaceId,
          projectId,
          taskId,
          text,
          isCompleted,
        }
      );

      // TODO need to make sure the case of new group of checklist if its added into an existing list
      const existingCheckboxes = await databases.listDocuments(
        DATABASE_ID,
        CHECKBOXES_ID,
        [Query.equal('checklistSetId', checklistId)]
      );

      const existingIds = new Set(
        existingCheckboxes.documents.map((doc) => doc.$id)
      ); // creating a list of set ids in order to save it for checking

      // updating if there is any new checkbox added to the list
      await Promise.all(
        list.map(async (item) => {
          // Check if the checkbox doesn't exist
          if (!existingIds.has(item.checkboxId)) {
            // Create new document only if it doesn't exist
            await databases.createDocument<Checkbox>(
              DATABASE_ID,
              CHECKBOXES_ID,
              ID.unique(),
              {
                checklistSetId: item.checklistSetId,
                checkboxText: item.checkboxText,
                isCheckboxCompleted: item.isCheckboxCompleted,
              }
            );
          }
        })
      );


      const updatedCheckboxes = await Promise.all(
        list.map(async (checkbox) => {
          // Only update if the checkbox exists
          if (existingIds.has(checkbox.checkboxId)) {
            return databases.updateDocument(
              DATABASE_ID,
              CHECKBOXES_ID,
              checkbox.checkboxId,
              {
                checkboxText: checkbox.checkboxText,
                isCheckboxCompleted: checkbox.isCheckboxCompleted,
              }
            );
          }
        })
      );

      return c.json({
        checklist: updatedChecklist,
        checkboxes: updatedCheckboxes,
      });
    }
  )

  // posting check boxes within a particular task
  .post(
    '/create-checklists',
    sessionMiddleware,
    zValidator('json', createChecklistSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId, projectId, taskId, text, isCompleted, list } =
        c.req.valid('json');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // new checklists added to databases
      const createdChecklist = await databases.createDocument<Checklist>(
        DATABASE_ID,
        CHECKLISTS_ID,
        ID.unique(),
        {
          workspaceId,
          projectId,
          taskId,
          text,
          isCompleted,
          userId: user.$id,
        }
      );
      // adding the the checkboxes to the databases based on the created checklist id
      const createdCheckboxes = list
        ? ((await Promise.all(
            list?.map(async (checkbox) => {
              const createdCheckbox = await databases.createDocument<Checkbox>(
                DATABASE_ID,
                CHECKBOXES_ID,
                ID.unique(),
                {
                  checklistSetId: createdChecklist.$id,
                  checkboxText: checkbox.checkboxText,
                  isCheckboxCompleted: checkbox.isCheckboxCompleted,
                }
              );
              return createdCheckbox;
            })
          )) as Checkbox[])
        : [];

      return c.json({
        checklist: createdChecklist,
        checkboxes: createdCheckboxes,
      });
    }
  );

export default app;
