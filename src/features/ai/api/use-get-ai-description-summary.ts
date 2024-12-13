import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.ai)['ai-response']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.ai)['ai-response']['$post']
>;

// custom hook to get ai response from the hono open ai route
export const useGetAIResponse = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.ai['ai-response']['$post']({ json });
      if (!response.ok) {
        throw new Error('Failed To Generate Response');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Your summary has been created');
      queryClient.invalidateQueries({ queryKey: ['response'] });
    },
    onError: () => {
      toast.error('Failed To Summarize Your Response');
    },
  });
  return mutation;
};
