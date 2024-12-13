'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJoinWorkspace } from '../api/use-join-workspace';
import { useInviteCode } from '../hooks/use-invite-code';
import { useWorkspaceId } from '../hooks/use-workspace-id';

interface JoinWorkspaceProps {
  initialValues: {
    name: string;
  };
}

export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceProps) => {
  const { mutate: joinWorkspace, isPending: isJoiningWorkspace } =
    useJoinWorkspace();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const router = useRouter();

  const onSubmit = () => {
    joinWorkspace(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join Workspaces</CardTitle>
        <CardDescription>
          You have been invited to join <strong>{initialValues.name} </strong>
          workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <Button
            disabled={isJoiningWorkspace}
            size={'lg'}
            asChild
            variant={'secondary'}
            type="button"
            className="w-full lg:w-fit"
          >
            <Link href={'/'}>Cancel</Link>
          </Button>
          <Button
            disabled={isJoiningWorkspace}
            size={'lg'}
            type="button"
            className="w-full lg:w-fit"
            onClick={onSubmit}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
