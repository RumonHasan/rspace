'use client';

// import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
// import Link from 'next/link';
import { useState } from 'react';
import RSearchInput from './components/rsearch-input';
import { LightbulbIcon } from 'lucide-react';

const RSearchClientPage = () => {
  //   const workspaceId = useWorkspaceId();
  const [isSearched] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!isSearched ? (
        <div className="text-center w-full max-w-2xl">
          <div className="flex items-center justify-center gap-7">
            <LightbulbIcon
              size={44}
              color="#9CA3AF"
              className="text-warm-gray-400"
            />
            <h1 className="text-3xl font-bold text-gray-500">
              How can I help you today?
            </h1>
          </div>
          <div className="mt-6">
            <RSearchInput />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default RSearchClientPage;
