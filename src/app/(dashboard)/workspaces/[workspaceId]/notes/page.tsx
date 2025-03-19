import NotesClientPage from './client';

import { useCurrent } from '@/features/auth/api/user-current';
import { redirect } from 'next/navigation';

const NotesPage = () => {
  const user = useCurrent();

  if (!user) {
    return redirect('/sign-in');
  }

  return <NotesClientPage />;
};

export default NotesPage;
