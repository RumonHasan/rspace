import { CreateCommentForm } from '@/features/comments/components/create-comment-form';
import { Task } from '../types';
import CommentsSection from '@/features/comments/components/comments-section';

interface TaskCommentsWrapperProps {
  task: Task;
}

export const TaskCommentsWrapper = ({ task }: TaskCommentsWrapperProps) => {
  return (
    <div className="flex flex-col w-full h-[600px]">
      {/* Fixed width and height */}
      <div className="flex-1 overflow-y-auto border min-h-0 mt-8 rounded-md">
        <CommentsSection initialData={task} />
      </div>
      <div className="mt-4">
        {/* Remove pb-20 and use margin for spacing */}
        <CreateCommentForm initialData={task} />
      </div>
    </div>
  );
};
