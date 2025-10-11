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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Um registro de suas transações financeiras mais recentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === 'revenue' ? (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      Receita
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      <TrendingDown className="mr-1 h-4 w-4" />
                      Despesa
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
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
