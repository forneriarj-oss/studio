import { getRevenue, getExpenses } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, CreditCard, ShieldCheck } from 'lucide-react';

export function OverviewCards() {
  const revenues = getRevenue();
  const expenses = getExpenses();

  const totalRevenue = revenues.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">+20.1% do último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">+18.3% do último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro</CardTitle>
          <ShieldCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(profit)}</div>
          <p className="text-xs text-muted-foreground">+22.4% do último mês</p>
        </CardContent>
      </Card>
    </div>
  );
}
