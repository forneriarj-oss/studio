'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Revenue, Expense } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface RevenueChartProps {
  revenue: Revenue[];
  expenses: Expense[];
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function RevenueChart({ revenue, expenses }: RevenueChartProps) {
  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};

  const processData = (items: (Revenue | Expense)[], type: 'revenue' | 'expense') => {
    items.forEach(item => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      monthlyData[month][type] += item.amount;
    });
  };

  processData(revenue, 'revenue');
  processData(expenses, 'expenses');

  const chartData = Object.keys(monthlyData)
    .map(month => ({
      month,
      revenue: monthlyData[month].revenue,
      expenses: monthlyData[month].expenses,
    }))
    .sort((a, b) => {
        const dateA = new Date(`01 ${a.month.replace("'", " 20")}`);
        const dateB = new Date(`01 ${b.month.replace("'", " 20")}`);
        return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Last 6 months

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Revenue and expenses for the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
