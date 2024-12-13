import { TaskStatus } from '../../types';

// Helper for colors
export const getStatusColor = (status: TaskStatus): { color: string; hoverColor: string } => {
    const colors = {
    [TaskStatus.BACKLOG]: { color: 'hsl(324, 100%, 75%)', hoverColor: 'hsl(324, 100%, 65%)' },
    [TaskStatus.TODO]: { color: 'hsl(0, 91%, 71%)', hoverColor: 'hsl(0, 91%, 61%)' },
    [TaskStatus.IN_PROGRESS]: { color: 'hsl(45, 100%, 51%)', hoverColor: 'hsl(45, 100%, 41%)' },
    [TaskStatus.IN_REVIEW]: { color: 'hsl(207, 90%, 64%)', hoverColor: 'hsl(207, 90%, 54%)' },
    [TaskStatus.DONE]: { color: 'hsl(152, 76%, 60%)', hoverColor: 'hsl(152, 76%, 50%)' },
    };
    return colors[status];
    };
