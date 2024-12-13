import { getCurrent } from '@/features/auth/queries';
import { getWorkspaces } from '@/features/workspaces/queries';
import { redirect } from 'next/navigation';

export default async function Home() {
  // server actions for user and workspaces
  const user = await getCurrent();

  // if user is authorized then fetch the workspaces or show the landing page
  if (user) {
    const workspaces = await getWorkspaces();
    if (workspaces?.total === 0) {
      redirect('/workspaces/create');
    } else {
      // default path for the first selected workspace
      redirect(`/workspaces/${workspaces?.documents[0].$id}`);
    }
  }
}
