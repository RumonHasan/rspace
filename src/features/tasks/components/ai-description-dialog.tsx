'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AiResponseProps } from './create-task-form';

interface AiResponseDialogProps {
  isAiResponseOpen: boolean;
  setIsAiResponseOpen: (open: boolean) => void;
  aiResponses?: AiResponseProps[];
  onSelect?: (response: AiResponseProps) => void;
  dialogTitle?: string;
}
// ai response dialog box
export const AiResponseDialog = ({
  isAiResponseOpen, // current state for ai response dialog box
  setIsAiResponseOpen, // opens the ai response dialog box
  aiResponses, // gets the accumulated ai responses
  onSelect, // passes the selected response to the parent company
  dialogTitle = 'Your summarized task description',
}: AiResponseDialogProps) => {
  // currently selected response
  const [selectedResponse, setSelectedResponse] =
    useState<AiResponseProps | null>(null);

  return (
    <Dialog open={isAiResponseOpen} onOpenChange={setIsAiResponseOpen}>
      <DialogContent className="w-full sm:max-w-[800px] p-6 border-none overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl mb-4">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiResponses?.map((response, index) => {
            const { content, type } = response;
            const isSelected = selectedResponse?.type === type;

            return (
              <div
                key={index}
                onClick={() => setSelectedResponse(response)}
                className={`shadow-md border rounded-lg p-6 flex flex-col space-y-3 cursor-pointer
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-500'
                  } transition-colors`}
              >
                <span className="text-lg font-medium">
                  {type[0].toUpperCase() + type.substring(1, type.length)}
                </span>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={() => {
              if (selectedResponse && onSelect) {
                onSelect(selectedResponse);
                setIsAiResponseOpen(false);
              }
            }}
            disabled={!selectedResponse}
          >
            Use Selected Format
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
