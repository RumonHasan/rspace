'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetSearchBarTasks } from '@/features/tasks/api/use-get-search-bar-tasks';
import { useGetSearchBarProjects } from '@/features/projects/api/use-get-search-bar-projects';
import { MembersAvatar } from '@/features/members/components/members-avatar';
import { Task } from '@/features/tasks/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Project } from '@/features/projects/types';
import { ProjectAvatar } from '@/features/projects/components/projects-avatar';
import { useGetAllNotes } from '@/features/notes/api/useGetAllNotes';
import { Note } from '@/features/notes/types';
import { NotebookIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FilteredTaskProps extends Task {
  assigneeName?: string;
  assigneeEmail?: string;
}

export const SearchBar = () => {
  const workspaceId = useWorkspaceId();
  const { data: searchBarTasks, isLoading: isLoadingSearchBarTasks } =
    useGetSearchBarTasks({ workspaceId });
  const { data: searchBarProjects, isLoading: isLoadingSearchBarProjects } =
    useGetSearchBarProjects({
      workspaceId,
    });
  const { data: searchBarNotes, isLoading: isLoadingSearchbarNotes } =
    useGetAllNotes({ workspaceId });

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [commandIsOpen, setCommandIsOpen] = useState(false);
  const commandContainerRef = useRef<HTMLDivElement>(null);
  const [originalTasks, setOriginalTasks] = useState<FilteredTaskProps[]>([]);
  const [originalProjects, setOriginalProjects] = useState<Project[]>([]);
  const [originalNotes, setOriginalNotes] = useState<Note[]>([]);

  // adding the original projects to the state
  useEffect(() => {
    if (searchBarProjects?.documents) {
      const mappedProjects = searchBarProjects.documents.map((project) => ({
        ...project,
      })) as Project[];
      setOriginalProjects(mappedProjects);
    }
  }, [searchBarProjects]);

  // adding the original notes to the state
  useEffect(() => {
    if (searchBarNotes?.documents) {
      const mappedNotes = searchBarNotes?.documents.map((note) => ({
        ...note,
      })) as Note[];
      setOriginalNotes(mappedNotes);
    }
  }, [searchBarNotes]);

  // Close the command if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandContainerRef.current &&
        !commandContainerRef.current.contains(event.target as Node)
      ) {
        setCommandIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // adding the filtered task states to populate it
  useEffect(() => {
    if (searchBarTasks?.documents) {
      const mappedTasks = searchBarTasks.documents.map((task) => ({
        ...task,
        assigneeName: task?.assigneeName || '', // Provide default value
        assigneeEmail: task?.assigneeEmail || '', // Provide default value
      })) as FilteredTaskProps[];
      setOriginalTasks(mappedTasks); // for resetting search field
    }
  }, [searchBarTasks]);

  // filterd Projects
  const filteredProjects = useMemo(() => {
    if (search.trim() === '') return originalProjects;
    const searchTerm = search.toLowerCase();
    return originalProjects.filter((project) =>
      project?.name.toLowerCase().includes(searchTerm)
    );
  }, [originalProjects, search]);

  // filtered Notes
  const filteredNotes = useMemo(() => {
    if (search.trim() === '') return originalNotes;
    const searchTerm = search.toLowerCase();
    return originalNotes.filter(
      (note) =>
        note?.noteTitle?.toLowerCase().includes(searchTerm) ||
        note?.note?.toLowerCase().includes(searchTerm)
    );
  }, [originalNotes, search]);

  // filtered Tasks
  const filteredTasks = useMemo(() => {
    if (search.trim() === '') return originalTasks;
    const searchTerm = search.toLowerCase();
    const filtered = originalTasks.filter(
      (task) =>
        task?.name?.toLowerCase().includes(searchTerm) ||
        task?.description?.toLowerCase().includes(searchTerm) ||
        task?.assigneeEmail?.toLowerCase().includes(searchTerm) ||
        task?.assigneeName?.toLowerCase().includes(searchTerm) ||
        task?.status?.toLowerCase().includes(searchTerm)
    );
    // Sort matches by relevance
    return filtered.sort((a, b) => {
      // Prioritize exact name matches
      const aNameMatch = a.name.toLowerCase() === searchTerm;
      const bNameMatch = b.name.toLowerCase() === searchTerm;
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // Then prioritize name starts with
      const aNameStarts = a.name.toLowerCase().startsWith(searchTerm);
      const bNameStarts = b.name.toLowerCase().startsWith(searchTerm);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      // Then by name includes
      const aNameIncludes = a.name.toLowerCase().includes(searchTerm);
      const bNameIncludes = b.name.toLowerCase().includes(searchTerm);
      if (aNameIncludes && !bNameIncludes) return -1;
      if (!aNameIncludes && bNameIncludes) return 1;

      return 0;
    });
  }, [search, originalTasks]);

  // function to close the command line and clear search when item is selected when an item is selected
  const handleItemClick = (href: string) => {
    console.log('click', href);
    if (href) {
      setCommandIsOpen(false);
      setSearch('');
      router.push(href);
    }
  };

  return (
    <div ref={commandContainerRef} className="relative w-full">
      <Command className="rounded-lg border shadow-sm" shouldFilter={false}>
        <CommandInput
          placeholder="Search tasks and projects..."
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setCommandIsOpen(true); // Open command list on input change
          }}
          onFocus={() => setCommandIsOpen(true)}
          className="h-10"
        />
        {commandIsOpen && (
          <div className="absolute top-full w-full z-50 mt-1">
            <CommandList className="rounded-lg border shadow-md bg-white">
              {!isLoadingSearchBarTasks && searchBarTasks?.documents && (
                <Tabs defaultValue="tasks" className="w-full p-2">
                  <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks">
                    <CommandGroup heading="Global Tasks">
                      {filteredTasks?.map((task) => (
                        <CommandItem
                          key={task?.$id}
                          value={`${task.$id}-${task.name}`}
                          className="cursor-pointer"
                        >
                          <div
                            className="flex flex-row gap-4 items-center"
                            onClick={() =>
                              handleItemClick(
                                `/workspaces/${workspaceId}/tasks/${task.$id}`
                              )
                            }
                          >
                            <MembersAvatar name={task?.name ?? ''} />
                            <span>{task?.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                      <CommandEmpty>No Tasks Found</CommandEmpty>
                    </CommandGroup>
                  </TabsContent>
                  <TabsContent value="projects">
                    <CommandGroup heading="Global Projects">
                      {!isLoadingSearchBarProjects &&
                        filteredProjects?.map((project) => (
                          <CommandItem
                            key={project.$id}
                            value={`${project.$id}-${project.name}`}
                            className="cursor-pointer"
                          >
                            <div
                              className="flex flex-row gap-4  items-center"
                              onClick={() =>
                                handleItemClick(
                                  `/workspaces/${workspaceId}/projects/${project.$id}`
                                )
                              }
                            >
                              <ProjectAvatar
                                className="size-3"
                                name={project.name}
                                image={project.imageUrl}
                              />
                              <span>{project?.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      <CommandEmpty>No Projects Found</CommandEmpty>
                    </CommandGroup>
                  </TabsContent>

                  <TabsContent value="notes">
                    <CommandGroup heading="Global Notes">
                      {!isLoadingSearchbarNotes &&
                        filteredNotes?.map((note) => (
                          <CommandItem
                            key={note.$id}
                            value={`${note.$id}-${note.noteTitle}`}
                            className="cursor-pointer"
                          >
                            <div
                              className="flex flex-row gap-4 items-center"
                              onClick={() =>
                                handleItemClick(
                                  `/workspaces/${workspaceId}/notes/${note.$id}`
                                )
                              }
                            >
                              <NotebookIcon className="w-4 h-4 text-blue-300" />
                              <span>{note?.noteTitle}</span>
                            </div>
                          </CommandItem>
                        ))}
                      <CommandEmpty>No Notes Found</CommandEmpty>
                    </CommandGroup>
                  </TabsContent>
                </Tabs>
              )}
              <CommandSeparator />
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
};
