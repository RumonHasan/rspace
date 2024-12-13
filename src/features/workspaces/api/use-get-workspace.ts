import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetWorkspaceProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  const query = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[':workspaceId'].$get({
        param: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Work Space');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
