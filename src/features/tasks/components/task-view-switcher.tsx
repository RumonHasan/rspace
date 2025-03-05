'use client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, PlusIcon } from 'lucide-react';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useGetTasks } from '../api/use-get-tasks';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useQueryState } from 'nuqs';
import { DataFilters } from './data-filter';
import { useTaskFilters } from '../hooks/use-tasks-filters';
import { DataTable } from './data-table';
import { columns } from './columns';
import { DataKanban } from './data-kanban';
import { useCallback } from 'react';
import { TaskUploadPayloadProps } from './data-kanban';
import { useBulkUpdateTasks } from '../api/use-bulk-update-task';
import Charts from './charts';
import { DataCalendar } from './data-calendar';

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
  projectIdTasks?: string;
}

// file that contains different tasks views switches between grid, kanban, calander and charts
export const TaskViewSwitcher = ({
  hideProjectFilter,
  projectIdTasks,
}: TaskViewSwitcherProps) => {
  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
  const tabsTypes = ['table', 'kanban', 'calendar', 'chart'];
  const { mutate: bulkUpdate } = useBulkUpdateTasks();
  const [view, setView] = useQueryState('task-view', {
    defaultValue: 'table',
    parse: (value) => (tabsTypes.includes(value) ? value : 'table'),
  });
  const { open } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();

  // fetching all tasks
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId,
    assigneeId,
    status,
    dueDate,
    projectIdPresentInTask: projectIdTasks,
  });

  const onKanbanChange = useCallback(
    (tasks: TaskUploadPayloadProps[]) => {
      // bulk updating json tasks
      bulkUpdate({
        json: { tasks },
      });
    },
    [bulkUpdate]
  );

  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
      defaultValue={view}
      onValueChange={setView}
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value={tabsTypes[0]}>
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value={tabsTypes[1]}>
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value={tabsTypes[2]}>
              Calendar
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value={tabsTypes[3]}>
              Charts
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={() => open(undefined)}
            size={'sm'}
            className="w-full lg:w-auto"
          >
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>
        <Separator className="my-4" />
        {/*Add filters */}
        {view !== 'chart' && (
          <>
            <DataFilters hideProjectFilter={hideProjectFilter} />
            <Separator className="my-4" />
          </>
        )}
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="animate-spin size-5 text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value={tabsTypes[0]} className="mt-0">
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value={tabsTypes[1]} className="mt-0">
              <DataKanban
                data={tasks?.documents ?? []}
                onChange={onKanbanChange}
              />
            </TabsContent>
            <TabsContent value={tabsTypes[2]} className="mt-0">
              <DataCalendar data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value={tabsTypes[3]} className="mt-0 h-full pb-4">
              <Charts data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
