import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { createCommentSchema } from '../schemas';
import { createAdminClient } from '@/lib/appwrite';
import { COMMENTS_ID, DATABASE_ID, IMAGES_BUCKET_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { Comment } from '../types';

const app = new Hono()
  // getting all the comments
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
      const { users } = await createAdminClient();

      const { workspaceId, taskId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      // have to return all the comments belonging to a particular task id
      const comments = await databases.listDocuments<Comment>(
        DATABASE_ID,
        COMMENTS_ID,
        [Query.equal('taskId', taskId), Query.orderDesc('$createdAt')]
      );
      // fitting the comments with their user name and email
      const populatedComments = await Promise.all(
        comments.documents.map(async (comment) => {
          const commentor = await users.get(comment.commentorId);
          return {
            ...comment,
            name: commentor.name,
            email: commentor.email,
          };
        })
      );

      return c.json({ data: populatedComments });
    }
  )
  // posting a particular comment
  .post(
    '/',
    sessionMiddleware,
    zValidator('form', createCommentSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const storage = c.get('storage');

      const formData = await c.req.formData();

      const workspaceId = formData.get('workspaceId') as string;
      const commentorId = formData.get('commentorId') as string;
      const comment = formData.get('comment') as string;
      const projectId = formData.get('projectId') as string;
      const taskId = formData.get('taskId') as string;
      const commentImage = formData.get('commentImage') as File;

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let commentImageUploadUrl: string | undefined;
      let commentImageId: string | undefined;

      // processing comment image
      if (commentImage) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          commentImage
        );
        commentImageId = file.$id;

        if (file) {
          const arrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id
          );
          commentImageUploadUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString('base64')}`;
        }
      } else {
        commentImageUploadUrl = undefined;
      }

      // adding a new comment along with a possible comment image
      const newComment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          workspaceId,
          commentorId,
          comment,
          projectId,
          taskId,
          commentImage: commentImageUploadUrl,
          commentImageId: commentImageId,
        }
      );
      return c.json({ data: newComment });
    }
  );
export default app;
