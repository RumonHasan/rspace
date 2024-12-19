'use client';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetChannels } from '../api/use-get-channels';
import { Separator } from '@/components/ui/separator';
import { MoreVerticalIcon, PlusIcon } from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { useCreateChannelModal } from '../hooks/use-create-channel-modal';
import { CreateChannelModal } from './create-channel-modal';
import { PageError } from '@/components/page-error';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import ChannelActions from './channel-actions';
import { EditChannelModal } from './edit-channel-modal';

const ChannelSidebar = () => {
  const workspaceId = useWorkspaceId();
  const pathName = useParams();
  const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
    workspaceId,
  });
  // for deleting channel and its associated messages
  const { open } = useCreateChannelModal();

  const isSidebarLoading = isLoadingChannels;

  if (!channels) {
    return <PageError message="No Channels To Be Loaded" />;
  }
  if (isSidebarLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-[700px] gap-2 border rounded-md shadow-sm p-4">
      <CreateChannelModal />
      <EditChannelModal />
      <div className="flex flex-row gap-2 items-center justify-between">
        <span className="text-muted-foreground">Create Channel</span>
        <PlusIcon className="h-5 w-5 cursor-pointer" onClick={open} />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {channels?.total > 0 ? (
          channels?.documents.map((channel) => {
            const { membersId } = channel;
            const slicedMembers = membersId.slice(0, 3); // for every collection it can show max three
            const selectedChannel = pathName.channelId === channel.$id;
            return (
              <Link
                key={channel.$id}
                href={`/workspaces/${workspaceId}/discussions/${channel.$id}`}
              >
                <div
                  key={channel.$id}
                  className={cn(
                    'rounded-md shadow-lg mb-2 flex flex-row items-center justify-between p-2 cursor-pointer',
                    selectedChannel ? 'border border-blue-400' : 'border-none'
                  )}
                >
                  <div className="flex flex-row gap-1.5 items-center justify-center">
                    <ChannelActions id={channel.$id} workspaceId={workspaceId}>
                      <MoreVerticalIcon className="size-4" />
                    </ChannelActions>

                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-muted-foreground text-sm">
                          {channel?.name && channel?.name.length > 15
                            ? channel?.name?.substring(0, 15) + '...'
                            : channel?.name}
                        </span>
                      </TooltipTrigger>
                      {channel?.name && channel?.name.length > 15 && (
                        <TooltipContent>
                          <div className="flex flex-row items-center justify-center">
                            {channel?.name}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex -space-x-4 rtl:space-x-reverse">
                        {slicedMembers.map((member) => {
                          const { name } = member;
                          const initial = name?.charAt(0).toUpperCase() || '?';

                          return (
                            <div
                              key={member.memberId}
                              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-medium border-2 border-white"
                            >
                              {initial}
                            </div>
                          );
                        })}
                        {slicedMembers.length < membersId.length && (
                          <span>...</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        {membersId.map((member) => {
                          return (
                            <span key={member.memberId}>{member.name}</span>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Link>
            );
          })
        ) : (
          <span className="text-muted-foreground text-center">
            No Channels Available
          </span>
        )}
      </div>
    </div>
  );
};

export default ChannelSidebar;
