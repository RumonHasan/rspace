import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferResponseType } from 'hono';

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export type WorkspaceResponseType = InferResponseType<
  (typeof client.api.workspaces)[':workspaceId']['analytics']['$get'],
  200
>;

// hook to return the current user
export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: UseGetWorkspaceAnalyticsProps) => {
  const query = useQuery({
    queryKey: ['workspace-analytics', workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[
        ':workspaceId'
      ].analytics.$get({
        param: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Workspace analytics');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
