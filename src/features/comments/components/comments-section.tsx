'use client';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetComments } from '../api/use-get-comments';
import { Task } from '@/features/tasks/types';
import { useCurrent } from '@/features/auth/api/user-current';
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';
import Image from 'next/image';

interface CommentsSectionProps {
  initialData: Task;
}

const CommentsSection = ({ initialData }: CommentsSectionProps) => {
  const workspaceId = useWorkspaceId();
  const { data: comments, isLoading } = useGetComments({
    workspaceId,
    taskId: initialData.$id,
  });
  const currentUser = useCurrent();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!comments?.length) {
    return <PageError message="No Comments Available" />;
  }

  // Reverse the comments array to show oldest first
  const orderedComments = [...comments].reverse();

  return (
    <div className="flex flex-col space-y-4 p-4 min-h-0">
      {orderedComments.map((comment) => {
        const isCurrentUser = comment.commentorId === currentUser.data?.$id;
        const commentImage = comment?.commentImage;

        return (
          <div
            key={comment.$id}
            className={`flex ${
              isCurrentUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isCurrentUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm mb-1">
                {isCurrentUser ? 'You' : comment.name}
              </div>
              <div className="break-words">{comment.comment}</div>
              {commentImage && (
                <div className="relative h-[200px] min-w-[250px] max-w-[400px] mt-2 rounded-lg overflow-hidden">
                  <Image
                    src={commentImage}
                    alt={comment.comment}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-xs mt-1 opacity-70">
                {new Date(comment.$createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;
