import React from 'react';
import { TaskStatus } from '../../types';
import { ChartTasksState } from '../charts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { getStatusColor } from './utils';
import { ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from 'recharts';
import { TooltipProps } from 'recharts';

interface BarChartProps {
  chartData: ChartTasksState;
}

export const BarChartComponent = ({ chartData }: BarChartProps) => {
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
      Object.entries(chartData).map(([status, tasks]) => {
        const statusColor = getStatusColor(status as TaskStatus);
        return {
          status,
          total: tasks.length,
          fill: statusColor.color, // Use fill instead of color for Recharts
          label: chartConfig[status as keyof typeof chartConfig]?.label,
        };
      }),
    [chartData, chartConfig]
  );

  const totalTasks = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.total, 0),
    [data]
  );

  // Custom Tooltip Component
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: data.fill }}
              />
              <span className="font-medium">{data.label}:</span>
            </div>
            <div className="text-right font-medium">
              {data.total}
              <span className="ml-2 text-muted-foreground">
                ({((data.total / totalTasks) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row gap-2">
        <span className="text-muted-foreground">Total Tasks:</span>
        <span className="font-medium text-foreground">{totalTasks}</span>
      </div>

      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[300px] min-w-[500px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs font-medium"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs font-medium"
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Rectangle
                  key={`rectangle-${index}`}
                  fill={entry.fill}
                  className="transition-colors hover:fill-opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
