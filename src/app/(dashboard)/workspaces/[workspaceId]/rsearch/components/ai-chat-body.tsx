'use client';
import React, { useState } from 'react';
import { AiChat } from '@/features/rsearch/schema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyCheck, CopyCheckIcon, NotebookIcon } from 'lucide-react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCreateNoteModal } from '@/features/notes/hooks/use-create-note-modal';

interface AiChatBodyProps {
  aiChats?: AiChat[];
}

const AiChatBody = ({ aiChats }: AiChatBodyProps) => {
  const [copyIndex, setCopyIndex] = useState<number | null>();
  const { open: openCreateNoteModal } = useCreateNoteModal(); // hook to open use create note modal
  // Get only AI responses (isHuman: false), which contain both query and response
  const formattedAiChats = // received in descending order of messages sent ... reversing it to make the latest ones appear below
    aiChats?.filter((chat) => !chat.isHuman).reverse() || [];

  // function to enable of copying to clipboard
  const copyToClipboard = (response: string, copyIndex: number) => {
    navigator.clipboard.writeText(response).then(() => {
      // setting copy check index to show it has been selected
      const resetTime = 2000;
      setCopyIndex(copyIndex);
      // after setting the copy index then turn it to null in order to reset time
      setTimeout(() => {
        setCopyIndex(null);
      }, resetTime);
    });
  };

  // function to open create note modal and pass on the response and query as a new notes object
  const handleCreateNoteModal = (aiChatResponseId: string) => {
    openCreateNoteModal(aiChatResponseId); // passing the ai chat response id to get the particular ai chat
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-6 py-4">
      {formattedAiChats.map((chat, index) => (
        <div key={index} className="flex flex-col w-full">
          {/* Question (Query) Box */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-2 border border-gray-200">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <span className="text-gray-500 text-sm">Q</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{chat.query}</p>
              </div>
            </div>
          </div>

          {/* Answer (Response) Box with Full Markdown */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="bg-gray-50 rounded-lg p-4 ml-4 border-l-4 border-blue-500 relative">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-500 text-sm">A</span>
                  </div>
                  <div className="flex-1 prose prose-sm max-w-none">
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {chat.response}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-auto p-2"
              align="end"
              side="top"
              sideOffset={10}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '1rem',
              }}
            >
              {/* Code for ai response actions current includes :
               * CopyButton
               * Create Notes Button
               */}
              <div className="flex gap-2 items-center cursor-pointer">
                <div>
                  {index === copyIndex ? (
                    <CopyCheckIcon
                      size={16}
                      className="text-green-500 hover:text-green-600"
                    />
                  ) : (
                    <CopyCheck
                      size={16}
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => copyToClipboard(chat.response, index)}
                    />
                  )}
                </div>

                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NotebookIcon
                          size={16}
                          className="cursor-pointer text-blue-600"
                          onClick={() => handleCreateNoteModal(chat.id)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-white">
                          Create A New Note From This Response
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      ))}
    </div>
  );
};

export default AiChatBody;
