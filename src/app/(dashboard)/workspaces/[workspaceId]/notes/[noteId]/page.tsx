import { useCurrent } from '@/features/auth/api/user-current';
import { redirect } from 'next/navigation';
import NotesIdClientPage from './client';

const NotesIdPage = () => {
  const user = useCurrent();

  if (!user) {
    return redirect('/sign-in');
  }

  return <NotesIdClientPage />;
};

export default NotesIdPage;
