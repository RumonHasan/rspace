import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.rsearch)['sonar-response']['chat-context']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.rsearch)['sonar-response']['chat-context']['$post']
>;

export const usePostAiChatContextChats = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.rsearch['sonar-response'][
        'chat-context'
      ]['$post']({ json });
      if (!response.ok) {
        throw new Error('Failed To Post A Search Query');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchQueries'] });
      queryClient.invalidateQueries({ queryKey: ['ai-chats-context'] });
    },
    onError: () => {
      toast.success('Failed To Post Search Query');
    },
  });
  return mutation;
};
