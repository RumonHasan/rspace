'use client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChecklistUI } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistDropDownActionProps {
  children: React.ReactNode;
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistUI[]>>;
}

const CheckListDropDown = ({
  children,
  setChecklists,
}: ChecklistDropDownActionProps) => {
  const [title, setTitle] = useState('');
  const [open, setIsOpen] = useState(false);
  // creates a checklist array with a check list name;
  const handleCreateChecklist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (title) {
      const newChecklist = {
        checklistId: uuidv4(),
        checklistName: title,
        list: [],
      };
      setChecklists((prevList) => [...prevList, newChecklist]);
      setTitle('');
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-2">
        <div className="flex flex-col gap-2 px-2">
          <span className="text-center text-muted-foreground">
            Add Checklist
          </span>
          <Label
            htmlFor="checklist-input-title"
            className="text-muted-foreground"
          >
            Title
          </Label>
          <Input
            id="checklist-input-title"
            placeholder="Checklist title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
          />
          <Button
            onClick={(e) => {
              // Handle creating checklist
              handleCreateChecklist(e);
            }}
            className="p-0.2 gap-1 hover:bg-muted rounded-sm flex items-center justify-center w-[70px]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CheckListDropDown;
