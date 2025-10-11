import { getRevenue, getExpenses } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function RecentActivity() {
  const revenues = getRevenue();
  const expenses = getExpenses();

  const transactions: Transaction[] = [
    ...revenues.map(r => ({ ...r, type: 'revenue' as const, description: r.source })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ];

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of your most recent financial transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === 'revenue' ? (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      Revenue
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      <TrendingDown className="mr-1 h-4 w-4" />
                      Expense
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell className={`text-right font-semibold ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'revenue' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
