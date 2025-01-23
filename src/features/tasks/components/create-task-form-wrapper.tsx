import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import { CreateTaskForm } from './create-task-form';
import { TaskStatus } from '../types';
import { Button } from '@/components/ui/button';
import { CheckCheckIcon } from 'lucide-react';
import CheckListDropDown from '@/features/checklists/components/create-checklist-dropdown';
import { useState } from 'react';
import {
  CheckboxUI,
  ChecklistProgressMap,
  ChecklistUI,
} from '@/features/checklists/types';
import { v4 as uuidv4 } from 'uuid';

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
  initialStatus: TaskStatus | undefined;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  initialStatus,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const [checklists, setChecklists] = useState<ChecklistUI[]>([]); // gets the new check list set
  const [checklistProgress, setChecklistProgress] =
    useState<ChecklistProgressMap>({}); //for storing the checklist progress rate
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  // deleting checklist from ui
  const handleChecklistDelete = (existingId: string) => {
    const newList = [...checklists].filter(
      (checklist) => checklist.checklistId !== existingId
    );
    setChecklists(newList);
  };

  // for adding a checkbox to the existing checklist
  const handleCheckboxSubmit = (payload: string, checklistId: string) => {
    if (!payload) return;
    const checkbox: CheckboxUI = {
      checklistSetId: checklistId,
      checkboxId: uuidv4(),
      checkboxText: payload,
      isCheckboxCompleted: false,
    };
    const updatedChecklist: ChecklistUI[] = checklists.map((checklist) => {
      if (checklist.checklistId === checklistId) {
        return {
          ...checklist,
          list: [...checklist.list, checkbox],
        };
      }
      return checklist;
    });
    setChecklists(updatedChecklist);
    // updating the progress of the checklists
    if (updatedChecklist) {
      updateProgressCheckboxList(checklistId, updatedChecklist);
    }
  };

  // deleting a checkbox within the ui
  const handleCheckboxDelete = (checkboxId: string, checklistSetId: string) => {
    const filteredChecklists = checklists.map((checklist) => {
      const { checklistId, list } = checklist;
      if (checklistId === checklistSetId) {
        const updatedCheckboxList = list.filter(
          (checkbox) => checkbox.checkboxId !== checkboxId
        );
        return {
          ...checklist,
          list: updatedCheckboxList,
        };
      } else {
        return checklist;
      }
    });
    setChecklists(filteredChecklists); // updating the ui with new checkbox list
    // updating the filtered list progress value recalculations
    if (filteredChecklists) {
      updateProgressCheckboxList(checklistSetId, filteredChecklists);
    }
  };

  // updating a specific checkbox from a particular list
  const handleCheckboxChecked = (
    checkboxId: string,
    checkboxListId: string,
    checked: boolean
  ) => {
    // First create the updated list
    const newChecklists = checklists.map((checklist) => {
      const { checklistId, list } = checklist;
      if (checklistId === checkboxListId) {
        const updatedList = list.map((checkbox) => {
          if (checkbox.checkboxId === checkboxId) {
            return {
              ...checkbox,
              isCheckboxCompleted: !checked,
            };
          }
          return checkbox;
        });
        return {
          ...checklist,
          list: updatedList,
        };
      }
      return checklist;
    });

    // Update both states using the same updated data
    setChecklists(newChecklists);
    if (newChecklists) {
      updateProgressCheckboxList(checkboxListId, newChecklists);
    }
  };

  // update progress checkbox list with latest loaded values
  const updateProgressCheckboxList = (
    checkboxListId: string,
    updatedChecklist: ChecklistUI[]
  ) => {
    const checklist = updatedChecklist.find(
      (checklist) => checklist.checklistId === checkboxListId
    );
    // finds the correct check list and stores its total and completed tasks in a checklistId object record
    if (checklist) {
      setChecklistProgress((prev) => ({
        ...prev,
        [checkboxListId]: {
          total: checklist.list.length,
          completed: checklist.list.filter(
            (checkbox: CheckboxUI) => checkbox.isCheckboxCompleted
          ).length,
        },
      }));
    }
  };

  // available project options and member options to show when making task
  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return (
      <Card className="w-full h-[1000px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-[1fr,200px] h-[85vh]">
      {/* Changed min-h to h-full */}
      {/* Main Content */}
      <div className="p-6 overflow-y-auto h-full">
        {/* Added h-full */}
        <CreateTaskForm
          checklistProgress={checklistProgress}
          handleCheckboxChecked={handleCheckboxChecked}
          checklists={checklists}
          onCancel={onCancel}
          initialStatus={initialStatus}
          memberOptions={memberOptions ?? []}
          projectOptions={projectOptions ?? []}
          handleChecklistDelete={handleChecklistDelete}
          handleCheckboxSubmit={handleCheckboxSubmit}
          handleCheckboxDelete={handleCheckboxDelete}
        />
      </div>
      {/* Side Panel */}
      <aside className="border-l border-border bg-muted/40 top-0">
        {/* Added h-full */}
        <div className="p-6 flex flex-col gap-0.5 mt-10">
          {/* Side panel content */}
          <CheckListDropDown setChecklists={setChecklists}>
            <Button
              variant={'outline'}
              className="rounded-md flex gap-1 flex-row justify-start hover:bg-muted/50 transition-colors"
            >
              <CheckCheckIcon size={'sm'} className="w-[20px] mr-2" />
              <span className="text-muted-foreground">Checklist</span>
            </Button>
          </CheckListDropDown>
        </div>
      </aside>
    </div>
  );
};
