import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.checklists)['delete-checkbox'][':checklistId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.checklists)['delete-checkbox'][':checklistId']['$delete']
>;

export const useDeleteCheckbox = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.checklists['delete-checkbox'][
        ':checklistId'
      ]['$delete']({ param, json });
      if (!response.ok) {
        throw new Error('Failed To Delete Checkbox');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('checkbox has been deleted');
      queryClient.invalidateQueries({ queryKey: ['checkbox'] });
    },
    onError: () => {
      toast.success('Failed To Delete Checklist');
    },
  });
  return mutation;
};
