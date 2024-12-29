import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.checklists)[':checklistId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.checklists)[':checklistId']['$patch']
>;

export const useUpdateChecklists = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.checklists[':checklistId']['$patch']({
        json,
        param,
      });
      if (!response.ok) {
        throw new Error('Failed To Update Checklists');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Checklists has been updated');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: () => {
      toast.success('Failed To Update Checklists');
    },
  });
  return mutation;
};
