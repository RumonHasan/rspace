import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.checklists)['create-checklists']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.checklists)['create-checklists']['$post']
>;

export const useCreateChecklists = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.checklists['create-checklists'][
        '$post'
      ]({ json });
      if (!response.ok) {
        throw new Error('Failed To Create Checklists');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Checklists has been added');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: () => {
      toast.success('Failed To Create Checklists');
    },
  });
  return mutation;
};
