'use client';

import { getRevenue, getExpenses } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Revenue, Expense } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const chartConfig = {
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Despesas',
    color: 'hsl(var(--chart-2))',
  },
  balance: {
    label: 'Saldo',
    color: 'hsl(var(--primary))',
  }
} satisfies ChartConfig;


export default function CashFlowPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const allRevenues = getRevenue();
  const allExpenses = getExpenses();

  const { filteredRevenues, filteredExpenses, startDate, endDate } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 6);
        break;
      case 'this_week':
        startDate = startOfWeek(now);
        break;
      case 'this_month':
        startDate = startOfMonth(now);
        break;
      default:
        startDate = subDays(now, 6);
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const filterByDate = (item: Revenue | Expense) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    };

    return {
      filteredRevenues: allRevenues.filter(filterByDate),
      filteredExpenses: allExpenses.filter(filterByDate),
      startDate,
      endDate
    };
  }, [timeRange, allRevenues, allExpenses]);

  const totalRevenue = filteredRevenues.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalRevenue - totalExpenses;

  const chartData = useMemo(() => {
    const data: { [key: string]: { revenue: number; expenses: number } } = {};
    const dayFormat = timeRange === 'this_month' ? 'dd/MM' : 'EEE';

    // Initialize data points
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = format(currentDate, dayFormat, { locale: ptBR });
      data[key] = { revenue: 0, expenses: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    filteredRevenues.forEach(r => {
      const key = format(new Date(r.date), dayFormat, { locale: ptBR });
      if(data[key]) data[key].revenue += r.amount;
    });
    filteredExpenses.forEach(e => {
      const key = format(new Date(e.date), dayFormat, { locale: ptBR });
      if(data[key]) data[key].expenses += e.amount;
    });

    return Object.keys(data).map(key => ({
      date: key,
      revenue: data[key].revenue,
      expenses: data[key].expenses,
    }));
  }, [filteredRevenues, filteredExpenses, timeRange, startDate, endDate]);

  const summaryByPaymentMethod = useMemo(() => {
    const summary: { [key: string]: { revenue: number; expenses: number } } = {
      PIX: { revenue: 0, expenses: 0 },
      'Cartão': { revenue: 0, expenses: 0 },
      'Dinheiro': { revenue: 0, expenses: 0 },
      'N/A': { revenue: 0, expenses: 0 },
    };

    filteredRevenues.forEach(r => {
      const method = r.paymentMethod || 'N/A';
      if (summary[method]) {
        summary[method].revenue += r.amount;
      }
    });

    filteredExpenses.forEach(e => {
      const method = e.paymentMethod || 'N/A';
      if (summary[method]) {
        summary[method].expenses += e.amount;
      }
    });

    return summary;
  }, [filteredRevenues, filteredExpenses]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="this_week">Esta Semana</SelectItem>
            <SelectItem value="this_month">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Fluxo de Caixa</CardTitle>
          <CardDescription>
            Mostrando resultados para o período de {format(startDate, 'P', { locale: ptBR })} até {format(endDate, 'P', { locale: ptBR })}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Despesas" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Forma de Pagamento</CardTitle>
          <CardDescription>Total de entradas e saídas por forma de pagamento no período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(summaryByPaymentMethod).map(([method, data]) => {
                    if (method === 'N/A' && data.revenue === 0 && data.expenses === 0) return null;
                    return (
                        <Card key={method}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{method}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Entradas</p>
                                    <p className="font-semibold text-green-600">{formatCurrency(data.revenue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Saídas</p>
                                    <p className="font-semibold text-red-600">{formatCurrency(data.expenses)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Saldo</p>
                                    <p className={`font-semibold ${data.revenue - data.expenses >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                        {formatCurrency(data.revenue - data.expenses)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
