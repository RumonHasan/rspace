import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
// hook to return the current user
export const useGetWorkspaces = () => {
  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await client.api.workspaces.$get();
      if (!response.ok) {
        throw new Error('Failed To Fetch Work Spaces');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
