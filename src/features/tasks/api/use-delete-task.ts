import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.tasks)[':taskId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[':taskId']['$delete']
>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[':taskId']['$delete']({ param });
      if (!response.ok) {
        throw new Error('Failed To Delete Task');
      }
      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Task Deleted');

      // Invalidate all affected queries with their full keys
      queryClient
        .invalidateQueries({
          predicate: (query) => {
            // Match any query that starts with these prefixes
            return [
              'tasks',
              'task',
              'project-analytics',
              'workspace-analytics',
              'comments',
              'search-bar-tasks',
              data.$id,
            ].some((key) => query.queryKey[0] === key);
          },
        })
        .then(() => {
          router.refresh();
        });
    },
    onError: () => {
      toast.error('Failed To Delete Tasks'); // Changed success to error
    },
  });
  return mutation;
};
