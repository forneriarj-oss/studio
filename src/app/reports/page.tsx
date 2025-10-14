'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import type { Sale, Expense, Revenue, FinishedProduct } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUser, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const { user, firestore } = useFirebase();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { startDate, endDate } = useMemo(() => {
    let start = dateRange?.from || new Date();
    let end = dateRange?.to || new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }, [dateRange]);

  const salesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !startDate || !endDate) return null;
    return query(collection(firestore, 'users', user.uid, 'sales'), where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
  }, [user, firestore, startDate, endDate]);

  const expensesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !startDate || !endDate) return null;
    return query(collection(firestore, 'users', user.uid, 'expenses'), where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
  }, [user, firestore, startDate, endDate]);

  const revenuesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !startDate || !endDate) return null;
    return query(collection(firestore, 'users', user.uid, 'revenues'), where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
  }, [user, firestore, startDate, endDate]);

  const productsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'finished-products');
  }, [user, firestore]);

  const { data: sales, isLoading: loadingSales } = useCollection<Sale>(salesQuery);
  const { data: expenses, isLoading: loadingExpenses } = useCollection<Expense>(expensesQuery);
  const { data: revenues, isLoading: loadingRevenues } = useCollection<Revenue>(revenuesQuery);
  const { data: products, isLoading: loadingProducts } = useCollection<FinishedProduct>(productsQuery);


  const reportData = useMemo(() => {
    if (!sales || !expenses || !revenues || !products) return null;

    const totalRevenue = revenues.reduce((acc, r) => acc + r.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    let totalCogs = 0;
    const salesByProduct = sales.reduce<Record<string, { name: string; category: string; quantity: number; totalValue: number; totalCost: number; }>>((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const saleValue = sale.unitPrice * sale.quantity;
            const costValue = product.finalCost * sale.quantity;
            totalCogs += costValue;
            
            if (!acc[product.id!]) {
                acc[product.id!] = { name: product.name, category: product.category, quantity: 0, totalValue: 0, totalCost: 0 };
            }
            acc[product.id!].quantity += sale.quantity;
            acc[product.id!].totalValue += saleValue;
            acc[product.id!].totalCost += costValue;
        }
        return acc;
    }, {});
    
    const salesByCategory = Object.values(salesByProduct).reduce<Record<string, number>>((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = 0;
        }
        acc[product.category] += product.totalValue;
        return acc;
    }, {});

    return {
        totalRevenue,
        totalCogs,
        totalExpenses,
        netProfit: totalRevenue - totalCogs - totalExpenses,
        salesByProduct: Object.values(salesByProduct).sort((a,b) => b.totalValue - a.totalValue),
        salesByCategory: Object.entries(salesByCategory).map(([name, value]) => ({name, value})),
    }

  }, [sales, expenses, revenues, products]);
  
  const exportToCSV = () => {
    if (!reportData) return;
    
    const headers = "Produto,Quantidade Vendida,Valor Bruto,Custo Total,Lucro Bruto\n";
    const csvContent = reportData.salesByProduct.map(p => 
      [p.name.replace(/,/g, ''), p.quantity, p.totalValue, p.totalCost, p.totalValue - p.totalCost].join(',')
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_vendas.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportToPDF = () => {
    if (!reportData || !dateRange?.from || !dateRange?.to) return;
    
    const doc = new jsPDF();
    const startDateFormatted = format(dateRange.from, 'dd/MM/yyyy');
    const endDateFormatted = format(dateRange.to, 'dd/MM/yyyy');
    
    doc.text(`Relatório de Desempenho`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${startDateFormatted} a ${endDateFormatted}`, 14, 26);

    autoTable(doc, {
        startY: 35,
        head: [['Métrica Financeira', 'Valor']],
        body: [
            ['Receita Total', formatCurrency(reportData.totalRevenue)],
            ['Custo dos Produtos Vendidos (CPV)', formatCurrency(reportData.totalCogs)],
            ['Despesas Totais', formatCurrency(reportData.totalExpenses)],
            [{ content: 'Lucro Líquido', styles: { fontStyle: 'bold' } }, { content: formatCurrency(reportData.netProfit), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'striped',
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    doc.addPage();
    doc.text(`Relatório de Vendas por Produto`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${startDateFormatted} a ${endDateFormatted}`, 14, 26);
    
    const salesTableData = reportData.salesByProduct.map(p => [
        p.name,
        p.quantity,
        formatCurrency(p.totalValue),
        formatCurrency(p.totalCost),
        formatCurrency(p.totalValue - p.totalCost)
    ]);

    autoTable(doc, {
        startY: 35,
        head: [['Produto', 'Qtde Vendida', 'Valor Bruto', 'Custo Total', 'Lucro Bruto']],
        body: salesTableData,
        theme: 'grid',
    });

    doc.save(`relatorio_gestorpro_${startDateFormatted}_${endDateFormatted}.pdf`);
  }

  const isLoading = loadingSales || loadingExpenses || loadingRevenues || loadingProducts;

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Analise o desempenho do seu negócio.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className="w-[280px] justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                    dateRange.to ? (
                        <>
                        {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                        </>
                    ) : (
                        format(dateRange.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Selecione uma data</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                />
                </PopoverContent>
            </Popover>
            <Button onClick={exportToCSV} variant="outline" disabled={isLoading || !reportData}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar CSV
            </Button>
            <Button onClick={exportToPDF} disabled={isLoading || !reportData}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
            </Button>
        </div>
      </div>
      
      {isLoading ? <p>Carregando dados do relatório...</p> : reportData ? (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Custo (CPV)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.totalCogs)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.totalExpenses)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData.netProfit)}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Vendas por Produto</CardTitle>
                    <CardDescription>Análise detalhada do desempenho de vendas por produto no período.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Qtde</TableHead>
                                <TableHead>Valor Bruto</TableHead>
                                <TableHead>Custo Total</TableHead>
                                <TableHead>Lucro Bruto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.salesByProduct.map(p => (
                                <TableRow key={p.name}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.quantity}</TableCell>
                                    <TableCell>{formatCurrency(p.totalValue)}</TableCell>
                                    <TableCell>{formatCurrency(p.totalCost)}</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(p.totalValue - p.totalCost)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Receita por Categoria</CardTitle>
                    <CardDescription>Distribuição da receita entre as categorias de produtos.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={reportData.salesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {reportData.salesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

      </>
      ) : <p>Não há dados suficientes no período selecionado para gerar o relatório.</p>}
    </div>
  );
}

    