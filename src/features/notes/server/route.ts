import { sessionMiddleware } from '@/lib/session-middleware';
import { Hono } from 'hono';
import { NotesSchema } from '../schema';
import { Note } from '../types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getMember } from '@/features/members/utils';
import { DATABASE_ID, NOTES_ID } from '@/config';
import { ID, Query } from 'node-appwrite';

const app = new Hono()

  // delete a particular note from the workspace
  .delete('/:noteId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { noteId } = c.req.param();

    const currNote = await databases.getDocument<Note>(
      DATABASE_ID,
      NOTES_ID,
      noteId
    );

    const member = await getMember({
      userId: user.$id,
      workspaceId: currNote.workspaceId,
      databases,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // deleted note object
    const deletedNote = await databases.deleteDocument(
      DATABASE_ID,
      NOTES_ID,
      noteId
    );

    // more logic needed to be entered for the ai chats to be deleted when deleted the note

    return c.json({ data: { $id: noteId } }, 200);
  })

  // get a particular note from the data under the same workspace
  .get('/:noteId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { noteId } = c.req.param();

    const currNote = await databases.getDocument<Note>(
      DATABASE_ID,
      NOTES_ID,
      noteId
    );

    const member = await getMember({
      userId: user.$id,
      workspaceId: currNote.workspaceId,
      databases,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 404);
    }

    const note = await databases.getDocument<Note>( // return a particular note based on note id and in same workspace
      DATABASE_ID,
      NOTES_ID,
      noteId
    );

    return c.json({ data: note }, 200);
  })

  // get all notes within the same workspace
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        userId: user.$id,
        workspaceId,
        databases,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const notes = await databases.listDocuments(DATABASE_ID, NOTES_ID, [
        Query.equal('workspaceId', workspaceId),
      ]);

      return c.json({ data: notes }, 200);
    }
  )
  // creating a single note under a single workspace
  .post('/', sessionMiddleware, zValidator('json', NotesSchema), async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { workspaceId, noteTitle, noteDescription, note, projectId } =
      c.req.valid('json');

    const member = await getMember({
      userId: user.$id,
      workspaceId,
      databases,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const newNoteObject = {
      workspaceId,
      noteTitle,
      noteDescription,
      note,
      projectId,
    };

    // creation of a single note in the same workspace
    const newNote = await databases.createDocument<Note>(
      DATABASE_ID,
      NOTES_ID,
      ID.unique(),
      newNoteObject
    );

    return c.json({ data: newNote }, 200);
  });

export default app;
