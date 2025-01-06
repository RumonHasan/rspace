import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.checklists)[':checklistId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.checklists)[':checklistId']['$delete']
>;

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.checklists[':checklistId']['$delete']({
        param,
      });
      if (!response.ok) {
        throw new Error('Failed To Delete Checklist');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Checklist has been deleted');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: () => {
      toast.success('Failed To Delete Checklist');
    },
  });
  return mutation;
};
