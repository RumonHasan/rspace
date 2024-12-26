import { Task, TaskStatus } from '../types';
import React, { useCallback, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { KanbanColumnHeader } from './kanban-column-header';
import { KanbanCard } from './kanban-card';

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
  data: Task[];
  onChange: (tasks: TaskUploadPayloadProps[]) => void;
}

export interface TaskUploadPayloadProps {
  $id: string;
  status: TaskStatus;
  position: number;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      // contains the individual blocks of tasks under various types of taskstatus section
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    // pushing the individual tasks by status
    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });
    // sorting in ascending order of positions
    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        (a, b) => a.position - b.position
      );
    });
    return initialTasks;
  });

  // updating the use Effect in order to make sure the tasks get actively deleted
  useEffect(() => {
    const newTasks: TasksState = {
      // contains the individual blocks of tasks under various types of taskstatus section
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    // pushing the individual tasks by status
    data.forEach((task) => {
      newTasks[task.status].push(task);
    });
    // sorting in ascending order of positions
    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });
    setTasks(newTasks);
  }, [data]);

  // on drag end functionality for the task cards
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }
      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destinationStatus = destination.droppableId as TaskStatus;

      let updatesPayload: TaskUploadPayloadProps[] = [];

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        // safely remove the task from the source column
        const sourceColumn = [...newTasks[sourceStatus]];
        // Remove the dragged task from its original position
        // splice returns an array of removed items, we take the first one
        const [movedTask] = sourceColumn.splice(source.index, 1);

        // if there is no moved task , return the previously existed task;
        if (!movedTask) {
          return prevTasks;
        }

        // create a new task object with updated status.. checking whether status changed or moving up and down the column
        const updatedMovedTask =
          sourceStatus !== destinationStatus
            ? { ...movedTask, status: destinationStatus }
            : movedTask;

        // updating the source column
        newTasks[sourceStatus] = sourceColumn;

        // add the task to the new destination column
        const destColumn = [...newTasks[destinationStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destinationStatus] = destColumn;

        // preare the minimal update payload
        updatesPayload = [];

        // always update for the moved tasks
        updatesPayload.push({
          $id: updatedMovedTask.$id,
          status: destinationStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000), // limiting tasks to a million
        });

        // update positions for affected tasks in the destination column
        newTasks[destinationStatus].forEach((task, index) => {
          if (task && task.$id !== updatedMovedTask.$id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            // assign it new position if the position is not equal to new task position
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: destinationStatus,
                position: newPosition,
              });
            }
          }
        });

        // udpdate the position in source column and the destination column onces task has been dragged from one column to another
        if (sourceStatus !== destinationStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              if (task.position !== newPosition) {
                updatesPayload.push({
                  $id: task.$id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }
        return newTasks;
      });
      onChange(updatesPayload);
    },
    [onChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                taskCount={tasks[board]?.length}
                board={board}
              />

              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => {
                      return (
                        <Draggable
                          key={task.$id}
                          draggableId={task.$id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                            >
                              <KanbanCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
