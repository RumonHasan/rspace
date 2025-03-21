import NotesClientPage from './client';

import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';

const NotesPage = async () => {
  const user = await getCurrent();

  if (!user) {
    redirect('/sign-in');
  }

  return <NotesClientPage />;
};

export default NotesPage;
