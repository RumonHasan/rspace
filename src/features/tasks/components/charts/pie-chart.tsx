'use client';

import * as React from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ChartTasksState } from '../charts';
import { TaskStatus } from '../../types';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getStatusColor } from './utils';

interface ChartProps {
  chartData: ChartTasksState;
}

type ViewBoxWithCenter = {
  cx?: number;
  cy?: number;
};

const PieChartComponent = ({ chartData }: ChartProps) => {
  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
      total: {
        label: 'Total Tasks',
      },
      [TaskStatus.BACKLOG]: {
        label: 'Backlog',
      },
      [TaskStatus.TODO]: {
        label: 'Todo',
      },
      [TaskStatus.IN_PROGRESS]: {
        label: 'In Progress',
      },
      [TaskStatus.IN_REVIEW]: {
        label: 'In Review',
      },
      [TaskStatus.DONE]: {
        label: 'Done',
      },
    }),
    []
  );

  const data = React.useMemo(
    () =>
      Object.entries(chartData).map(([status, tasks]) => ({
        status,
        total: tasks.length,
        color: getStatusColor(status as TaskStatus).color,
      })),
    [chartData]
  );

  const totalTasks = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.total, 0),
    [data]
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="total"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell strokeWidth={2} key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as ViewBoxWithCenter;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    <tspan
                      x={cx}
                      y={cy}
                      dy="-0.5em"
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalTasks}
                    </tspan>
                    <tspan
                      x={cx}
                      y={cy}
                      dy="1.5em"
                      className="fill-muted-foreground text-sm"
                    >
                      Tasks
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PieChartComponent;
