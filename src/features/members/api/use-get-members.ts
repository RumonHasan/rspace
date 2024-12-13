import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

//members will accept a workspace id in order to fetch all the members of that particular workspace
interface UseGetMembersProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const query = useQuery({
    queryKey: ['members', workspaceId], // when the workspace id changes it will fetch new members
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch The Members');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
