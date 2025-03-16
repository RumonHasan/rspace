'use client';
import { useState } from 'react';
import RSearchInput from './components/rsearch-input';
import { LightbulbIcon } from 'lucide-react';
import { useCurrent } from '@/features/auth/api/user-current';

// animation imports
import AiSearchAnimation from 'public/ai-search-light.json';
import Lottie from 'lottie-react';

const RSearchClientPage = () => {
  const { data: currentUser } = useCurrent();
  const [isAiResponding, setIsAiResponding] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center w-full max-w-6xl px-4">
        <div className="flex items-center justify-center gap-7 mb-6">
          {isAiResponding ? (
            <Lottie
              animationData={AiSearchAnimation}
              loop={true}
              style={{ height: 60, width: 60 }}
            />
          ) : (
            <LightbulbIcon
              size={44}
              color="#9CA3AF"
              className="text-warm-gray-400"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-500">
            Good Day {currentUser?.name}!!!
          </h1>
        </div>
        <RSearchInput setIsAiResponding={setIsAiResponding} />
      </div>
    </div>
  );
};

export default RSearchClientPage;
