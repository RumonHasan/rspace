'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import EditChannelForm from './edit-channel-form';
import { useCurrent } from '@/features/auth/api/user-current';
import { useGetChannel } from '../api/use-get-channel';

interface CreateChannelFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditChannelFormWrapper = ({
  onCancel,
  id,
}: CreateChannelFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const { data: initialChannelValues } = useGetChannel({ channelId: id });

  // Filter out current user and create member options
  const filteredMembers = members?.documents.filter(
    (member) => member.userId !== currentUser?.$id
  );
  // possible member options to create channels without including the user id
  const memberOptions =
    filteredMembers?.map((member) => ({
      label: member.name,
      value: member.userId,
    })) || [];

  if (isLoadingMembers) {
    return (
      <Card className="w-full h-[200px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialChannelValues) {
    return null;
  }

  return (
    <div>
      <EditChannelForm
        initialValues={initialChannelValues}
        onCancel={onCancel}
        memberOptions={memberOptions}
      />
    </div>
  );
};

export default EditChannelFormWrapper;
