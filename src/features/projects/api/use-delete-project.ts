import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.projects)[':projectId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[':projectId']['$delete']
>;

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.projects[':projectId']['$delete']({
        param,
      });
      if (!response.ok) {
        throw new Error('Failed To Update Project');
      }
      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.$id] }); // updating that specific workspaces
      queryClient.invalidateQueries({ queryKey: ['search-bar-projects'] }); //will refetch the search bar projects after deletion
    },
    onError: () => {
      toast.success('Failed To Delete project');
    },
  });
  return mutation;
};
