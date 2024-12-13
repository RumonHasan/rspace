'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import CreateChannelForm from './create-channels-form';
import { useCurrent } from '@/features/auth/api/user-current';

interface CreateChannelFormWrapperProps {
  onCancel: () => void;
}

export const CreateChannelFormWrapper = ({
  onCancel,
}: CreateChannelFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

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

  return (
    <div>
      <CreateChannelForm onCancel={onCancel} memberOptions={memberOptions} />
    </div>
  );
};

export default CreateChannelFormWrapper;
