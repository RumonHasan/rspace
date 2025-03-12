'use client';

import RSearchInput from './components/rsearch-input';
import { LightbulbIcon } from 'lucide-react';
import { useCurrent } from '@/features/auth/api/user-current';

const RSearchClientPage = () => {
  const { data: currentUser } = useCurrent();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center w-full max-w-6xl px-4">
        <div className="flex items-center justify-center gap-7 mb-6">
          <LightbulbIcon
            size={44}
            color="#9CA3AF"
            className="text-warm-gray-400"
          />
          <h1 className="text-3xl font-bold text-gray-500">
            Good Day {currentUser?.name}!!!
          </h1>
        </div>
        <RSearchInput />
      </div>
    </div>
  );
};

export default RSearchClientPage;
