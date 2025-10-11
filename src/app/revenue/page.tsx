'use client';
import { useState } from 'react';
import { getRevenue, addRevenue } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentMethod, Revenue } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<Revenue[]>(getRevenue());
  const [newRevenue, setNewRevenue] = useState({
    source: '',
    amount: '',
    paymentMethod: 'PIX' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const handleAddRevenue = () => {
    if (!newRevenue.source || !newRevenue.amount) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, preencha a fonte e o valor.',
      });
      return;
    }

    const revenueToAdd: Revenue = {
      id: `rev-${Date.now()}`,
      source: newRevenue.source,
      amount: parseFloat(newRevenue.amount),
      date: newRevenue.date,
      paymentMethod: newRevenue.paymentMethod,
    };
    
    addRevenue(revenueToAdd); // Adiciona ao mock de dados
    setRevenues(prev => [revenueToAdd, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Adiciona ao estado local

    toast({
      title: 'Receita Adicionada!',
      description: `${revenueToAdd.source} foi registrada com sucesso.`,
    });

    // Reset form
    setNewRevenue({
      source: '',
      amount: '',
      paymentMethod: 'PIX' as PaymentMethod,
      date: new Date().toISOString().split('T')[0],
    });
  }


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Receita</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Receita</CardTitle>
              <CardDescription>Registre uma nova fonte de renda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="source">Fonte</Label>
                  <Input id="source" placeholder="ex: Projeto de Cliente" value={newRevenue.source} onChange={(e) => setNewRevenue({...newRevenue, source: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input id="amount" type="number" placeholder="ex: 1500.00" value={newRevenue.amount} onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={newRevenue.paymentMethod} onValueChange={(value) => setNewRevenue({...newRevenue, paymentMethod: value as PaymentMethod})}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Selecione uma forma" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" value={newRevenue.date} onChange={(e) => setNewRevenue({...newRevenue, date: e.target.value})} />
                </div>
                <Button className="w-full" onClick={handleAddRevenue}>Adicionar Receita</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Toda a Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues.map(revenue => (
                    <TableRow key={revenue.id}>
                      <TableCell className="font-medium">{revenue.source}</TableCell>
                      <TableCell><Badge variant="outline">{revenue.paymentMethod || 'N/A'}</Badge></TableCell>
                      <TableCell>{new Date(revenue.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(revenue.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
