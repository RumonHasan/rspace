'use client';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '../../workspaces/hooks/use-workspace-id';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { Fragment } from 'react';
import { MembersAvatar } from '@/features/members/components/members-avatar';
import { useConfirm } from '@/hooks/use-confirm';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteMember } from '@/features/members/api/use-delete-member';
import { useUpdateMemberRole } from '@/features/members/api/use-update-member';
import { MemberRole } from '@/features/members/types';

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    'Remove member',
    'This member will be removed from the workspace',
    'destructive'
  );

  const { data } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMemberRole();

  // update member role
  const handleUpdateMember = async (memberId: string, role: MemberRole) => {
    updateMember({
      json: {
        role,
      },
      param: { memberId },
    });
  };

  // deleting a particular member
  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;
    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button variant={'secondary'} size="sm">
          <Link
            href={`/workspaces/${workspaceId}`}
            className="flex items-center"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => {
          return (
            <Fragment key={member.$id}>
              <div className="flex items-center gap-2">
                <MembersAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <p className="text-sm font-medium">{member.name}</p>
                    <span className="bg-amber-500 p-0.5 rounded-md">
                      <p className="text-xs font-medium text-white">
                        {member.role[0] +
                          member.role
                            .substring(1, member.role.length)
                            .toLowerCase()}
                      </p>
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="ml-auto"
                      variant={'secondary'}
                      size={'icon'}
                    >
                      <MoreVerticalIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className="font-medium cursor-pointer"
                      onClick={() => {
                        handleUpdateMember(member.$id, MemberRole.ADMIN);
                      }}
                      disabled={isUpdatingMember}
                    >
                      Set as Administrator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium cursor-pointer"
                      onClick={() => {
                        handleUpdateMember(member.$id, MemberRole.MEMBER);
                      }}
                      disabled={isUpdatingMember}
                    >
                      Set as Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium text-amber-700 cursor-pointer"
                      onClick={() => {
                        handleDeleteMember(member.$id);
                      }}
                      disabled={isDeletingMember}
                    >
                      Remove {member.name}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {index < data.documents.length - 1 && (
                <Separator className="my-2.5 " />
              )}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};
