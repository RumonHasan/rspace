import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader, CheckCheckIcon } from 'lucide-react';
import { EditTaskForm } from './edit-task-form';
import { useGetTask } from '../api/use-get-task';
import { Button } from '@/components/ui/button';
import CheckListDropDown from '@/features/checklists/components/create-checklist-dropdown';
import { useEffect, useState } from 'react';
import {
  CheckboxUI,
  ChecklistProgressMap,
  ChecklistUI,
} from '@/features/checklists/types';
import { useGetChecklists } from '@/features/checklists/api/use-get-checklists';
import { v4 as uuidv4 } from 'uuid';

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const [checklists, setChecklists] = useState<ChecklistUI[]>([]);
  const [checklistProgress, setChecklistProgress] =
    useState<ChecklistProgressMap>({});

  const { data: existingChecklists } = useGetChecklists({
    workspaceId,
    taskId: id,
  }); // getting the existing checklists

  // populating with existing checklist
  useEffect(() => {
    if (existingChecklists) {
      const newExistingChecklist: ChecklistUI[] = existingChecklists.map(
        (checklist) => {
          return {
            checklistId: checklist.$id,
            checklistName: checklist.text,
            list: checklist.list.map((item) => {
              return {
                checkboxId: item.$id,
                checklistSetId: item.$checklistSetId,
                checkboxText: item.checkboxText,
                isCheckboxCompleted: item.isCheckboxCompleted,
              };
            }),
          };
        }
      );
      setChecklists(newExistingChecklist);
    }
  }, [existingChecklists]); // checklists from existing list

  const { data: initialValues, isLoading: isTaskLoading } = useGetTask({
    taskId: id,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });


  const handleChecklistDelete = (existingId: string) => {
    const newList = [...checklists].filter(
      (checklist) => checklist.checklistId !== existingId
    );
    setChecklists(newList);
  };

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
    if (updatedChecklist) {
      updateProgressCheckboxList(checklistId, updatedChecklist);
    }
  };

  const handleCheckboxChecked = (
    checkboxId: string,
    checkboxListId: string,
    checked: boolean
  ) => {
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

    setChecklists(newChecklists);
    if (newChecklists) {
      updateProgressCheckboxList(checkboxListId, newChecklists);
    }
  };

  const updateProgressCheckboxList = (
    checkboxListId: string,
    updatedChecklist: ChecklistUI[]
  ) => {
    const checklist = updatedChecklist.find(
      (checklist) => checklist.checklistId === checkboxListId
    );
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

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isLoadingProjects || isLoadingMembers || isTaskLoading;

  if (isLoading) {
    return (
      <Card className="w-full h-[1000px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValues) {
    return null;
  }

  return (
    <div className="grid grid-cols-[1fr,200px] h-[85vh]">
      <div className="p-6 overflow-y-auto h-full">
        <EditTaskForm
          taskId={id}
          checklistProgress={checklistProgress}
          handleCheckboxChecked={handleCheckboxChecked}
          checklists={checklists}
          onCancel={onCancel}
          initialValues={initialValues}
          memberOptions={memberOptions ?? []}
          projectOptions={projectOptions ?? []}
          handleChecklistDelete={handleChecklistDelete}
          handleCheckboxSubmit={handleCheckboxSubmit}
        />
      </div>
      <aside className="border-l border-border bg-muted/40 top-0">
        <div className="p-6 flex flex-col gap-0.5 mt-10">
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
