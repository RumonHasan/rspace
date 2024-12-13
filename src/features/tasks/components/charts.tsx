'use client';
import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import PieChartComponent from './charts/pie-chart';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { useQueryState } from 'nuqs';
import { BarChartComponent } from './charts/bar-chart';

interface ChartDataProps {
  data: Task[];
}
// will contain the tasks and length
export type ChartTasksState = {
  [key in TaskStatus]: Task[];
};

const Charts = ({ data }: ChartDataProps) => {
  const chartTypes = ['pie', 'bar'];
  const [chartView, setChartView] = useQueryState('chart-view', {
    defaultValue: 'pie',
  });

  const [tasks] = useState<ChartTasksState>(() => {
    const initialTasks: ChartTasksState = {
      // contains the individual blocks of tasks under various types of taskstatus section
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    data.forEach((task) => initialTasks[task.status].push(task));
    return initialTasks;
  });

  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
      defaultValue={chartView}
      onValueChange={setChartView}
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value={chartTypes[0]}>
              Pie
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value={chartTypes[1]}>
              Bar
            </TabsTrigger>
          </TabsList>
        </div>
        <div>
          <TabsContent value={chartTypes[0]} className="mt-0">
            <PieChartComponent chartData={tasks} />
          </TabsContent>
          <TabsContent value={chartTypes[1]} className="mt-0">
            <BarChartComponent chartData={tasks} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default Charts;
