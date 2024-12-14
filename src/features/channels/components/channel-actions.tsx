'use client';

import { useConfirm } from '@/hooks/use-confirm';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'; // Change the import to use shadcn/ui version
import { TrashIcon, EditIcon } from 'lucide-react';
import { useDeleteChannel } from '../api/use-delete-channel';

interface ChannelActionProps {
  id: string;
  workspaceId: string;
  children: React.ReactNode;
}

const ChannelActions = ({ id, workspaceId, children }: ChannelActionProps) => {
  const { mutate: deleteChannel, isPending: isDeletingChannel } =
    useDeleteChannel();

  const [ConfirmDialog, confirm] = useConfirm(
    'Delete Channel',
    'This channel will be deleted permanently',
    'destructive'
  );

  // delete channel
  const handleDeleteChannel = async () => {
    const ok = await confirm();
    if (!ok) return;
    if (ok) {
      deleteChannel(
        {
          param: { channelId: id },
        },
        {
          onSuccess: () => {
            // push directly to the discussions to make a rerender of the entire channel list
            window.location.href = `/workspaces/${workspaceId}/discussions`;
          },
        }
      );
    }
  };
  return (
    <div>
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28">
          <DropdownMenuItem
            className="font-medium p-[10px] cursor-pointer flex flex-row items-center justify-between"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteChannel();
            }}
            disabled={isDeletingChannel}
          >
            <span className="text-muted-foreground">Delete</span>
            <TrashIcon className="w-[20px] h-[20px]" />
          </DropdownMenuItem>
          <DropdownMenuItem className="font-medium p-[10px] cursor-pointer flex flex-row items-center justify-between">
            <span className="text-muted-foreground">Edit</span>
            <EditIcon className="w-[20px] h-[20px]" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChannelActions;
