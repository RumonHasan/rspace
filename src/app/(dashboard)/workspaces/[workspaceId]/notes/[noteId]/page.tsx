import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import NotesIdClientPage from './client';

const NotesIdPage = async () => {
  const user = await getCurrent();

  if (!user) {
    return redirect('/sign-in');
  }

  return <NotesIdClientPage />;
};

export default NotesIdPage;
