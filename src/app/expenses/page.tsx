'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Expense, ExpenseCategory, PaymentMethod } from '@/lib/types';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

const categories: ExpenseCategory[] = ['Marketing', 'Vendas', 'Software', 'Equipe', 'Outros'];
const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];
const categoryTranslations: Record<ExpenseCategory, string> = {
  Marketing: 'Marketing',
  Vendas: 'Vendas',
  Software: 'Software',
  Equipe: 'Equipe',
  Outros: 'Outros'
};

const expenseCategoriesForSelect: ExpenseCategory[] = ['Marketing', 'Vendas', 'Software', 'Equipe', 'Outros'];


export default function ExpensesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const expensesRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/expenses`) : null),
    [firestore, user]
  );
  const { data: expenseList, isLoading } = useCollection<Expense>(expensesRef);

  const { toast } = useToast();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expensesRef) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
      return;
    }
    if (!description || !amount || !category || !date) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
      });
      return;
    }

    const newExpense: Omit<Expense, 'id'> = {
      description,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      paymentMethod: paymentMethod as PaymentMethod,
      date: new Date(date).toISOString(),
    };

    await addDoc(expensesRef, newExpense);

    toast({
      title: 'Despesa Adicionada!',
      description: `${description} foi registrada com sucesso.`,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setPaymentMethod('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Despesa</CardTitle>
              <CardDescription>Registre uma nova despesa de negócios.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddExpense}>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" placeholder="ex: Assinatura do Figma" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input id="amount" type="number" placeholder="ex: 350.00" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategoriesForSelect.map(cat => (
                        <SelectItem key={cat} value={cat}>{categoryTranslations[cat]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
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
                  <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Adicionar Despesa</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={5} className="text-center h-24">Carregando despesas...</TableCell></TableRow>}
                  {!isLoading && expenseList?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell><Badge variant="outline">{categoryTranslations[expense.category as ExpenseCategory] || expense.category}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{expense.paymentMethod || 'N/A'}</Badge></TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        - {formatCurrency(expense.amount)}
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
