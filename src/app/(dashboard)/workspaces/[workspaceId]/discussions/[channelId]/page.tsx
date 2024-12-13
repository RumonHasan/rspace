import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import ChannelIdClientPage from './client';

const ChannelPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }
  return <ChannelIdClientPage />;
};

export default ChannelPage;
