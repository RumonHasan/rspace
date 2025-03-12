'use client';

import { useState } from 'react';
import LoaderPage from '@/app/loading';
import { useGetAiChats } from '@/features/rsearch/api/useGetAiChats';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface RecentSearchedProps {
  workspaceId: string;
}

const RecentSearches = ({ workspaceId }: RecentSearchedProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const prevSearchLimit = 6;
  const { data: recentSearches, isLoading: isRecentSearchesLoading } =
    useGetAiChats({
      workspaceId,
      limit: prevSearchLimit,
    });

  if (isRecentSearchesLoading) {
    return <LoaderPage />;
  }

  if (!recentSearches || recentSearches.total === 0) {
    return (
      <span className="text-center text-muted-foreground text-sm">
        No Recent Searched Conducted...
      </span>
    );
  }

  const aiResponseCleaner = (response: string) => {
    return response.length > 100 ? (
      <span>{response.substring(0, 100)}...</span>
    ) : (
      response
    );
  };

  return (
    <div className="w-full text-left">
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between text-sm font-medium border border-slate-500 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors"
      >
        Recent Searches
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </span>

      <div className="overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {recentSearches.documents.map((search, index) => {
                  const toChatContextIdPageRef = `/workspaces/${workspaceId}/rsearch/rsearch-channel/${search.chatContextId}`; // full paht to channel context id
                  return (
                    <Link
                      href={toChatContextIdPageRef}
                      key={search.$id || index}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white shadow-md rounded-lg p-2 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {search.query.length > 50
                            ? `${search.query.substring(0, 50)}...`
                            : search.query || `Search ${index + 1}`}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {search.response ? (
                            <Tooltip>
                              <TooltipTrigger>
                                {aiResponseCleaner(search.response)}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-normal break-words">
                                {search.response}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            'No description available.'
                          )}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentSearches;
