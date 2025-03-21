import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import RSearchClientPage from './client';

const RSearchPage = async () => {
  const user = await getCurrent();

  // redirects to sign in if no user
  if (!user) {
    redirect('/sign-in');
  }

  return <RSearchClientPage />;
};

export default RSearchPage;
