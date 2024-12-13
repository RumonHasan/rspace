import { getCurrent } from '@/features/auth/queries';
import { JoinWorkspaceForm } from '@/features/workspaces/components/join-workspace-form';
import { getWorkspaceJoinDetails } from '@/features/workspaces/queries';
import { redirect } from 'next/navigation';

interface WorkspaceJoinPageProps {
  params: {
    workspaceId: string;
    inviteCode: string;
  };
}
// workspace id join page
const WorkspaceIdJoinPage = async ({ params }: WorkspaceJoinPageProps) => {
  const { workspaceId } = params;
  const user = await getCurrent();

  if (!user) {
    redirect('/sign-in');
  }

  const initialValues = await getWorkspaceJoinDetails({
    // getting workspace detail for the joinee
    workspaceId: workspaceId,
  });

  if (!initialValues) {
    redirect('/');
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  );
};

export default WorkspaceIdJoinPage;
