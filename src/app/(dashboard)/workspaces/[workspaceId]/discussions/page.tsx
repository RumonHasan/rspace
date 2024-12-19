'use client';
import { PageError } from '@/components/page-error';
import { useCurrent } from '@/features/auth/api/user-current';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { redirect } from 'next/navigation';

const DiscussionPage = () => {
  const user = useCurrent();
  const workspaceId = useWorkspaceId();
  const { data: channels, isLoading } = useGetChannels({ workspaceId });

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }
  if (!channels) {
    return <PageError message="No Channels Available" />;
  }


  if (channels?.total > 0) {
    redirect(
      `/workspaces/${workspaceId}/discussions/${channels?.documents[0].$id}`
    ); // redirects to the chat board page
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">No Channel Selected</h2>
        <p className="text-gray-600">
          {channels?.total === 0
            ? 'Create your first channel to get started'
            : 'Select a channel from the sidebar'}
        </p>
      </div>
    </div>
  );
};

export default DiscussionPage;
