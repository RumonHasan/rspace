'use client';

import { cn } from '@/lib/utils';
import { ChecklistProgress } from '../types';

interface ChecklistPercentageLoaderProps {
  data: ChecklistProgress;
}

const ChecklistPercentageLoader = ({
  data,
}: ChecklistPercentageLoaderProps) => {
  const { total, completed } = data;

  // rounded loader length
  const loaderPercentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full space-y-2 mt-2 mb-2">
      {/* Progress bar container */}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            loaderPercentage === 100 ? 'bg-green-500' : 'bg-green-400'
          )}
          style={{ width: `${loaderPercentage}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{loaderPercentage}% completed</span>
        <span>
          {completed}/{total} checklists
        </span>
      </div>
    </div>
  );
};

export default ChecklistPercentageLoader;
