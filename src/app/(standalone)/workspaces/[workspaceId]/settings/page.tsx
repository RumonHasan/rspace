import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import { WorkspaceIdClient } from './client';

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }
  return <WorkspaceIdClient />;
};

export default WorkspaceIdSettingsPage;
