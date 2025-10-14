'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Sale, FinishedProduct, RawMaterial, Revenue } from '@/lib/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Mock Data
const MOCK_REVENUES: Revenue[] = [
  { id: 'rev1', source: 'Venda de Bolo de Chocolate', amount: 50, date: new Date().toISOString(), paymentMethod: 'PIX' },
  { id: 'rev2', source: 'Venda de Torta de Maçã', amount: 75, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), paymentMethod: 'Cartão' },
];

const MOCK_SALES: Sale[] = [
  { id: 'sale1', productId: 'prod1', flavorId: 'flav1', quantity: 2, unitPrice: 25, date: new Date().toISOString() },
];

const MOCK_PRODUCTS: FinishedProduct[] = [
  { id: 'prod1', sku: 'SKU001', name: 'Bolo de Chocolate', category: 'Bolos', unit: 'UN', recipe: [], finalCost: 15, salePrice: 25, flavors: [{id: 'flav1', name: 'Comum', stock: 8}] },
  { id: 'prod2', sku: 'SKU002', name: 'Torta de Maçã', category: 'Tortas', unit: 'UN', recipe: [], finalCost: 20, salePrice: 35, flavors: [{id: 'flav2', name: 'Comum', stock: 3}] },
];

const MOCK_RAW_MATERIALS: RawMaterial[] = [
    { id: 'raw1', code: 'RM001', description: 'Farinha de Trigo', unit: 'KG', cost: 5, supplier: 'Fornecedor A', quantity: 8, minStock: 10 },
    { id: 'raw2', code: 'RM002', description: 'Ovos', unit: 'UN', cost: 0.5, supplier: 'Fornecedor B', quantity: 20, minStock: 24 },
];


export default function Home() {
  const [timeRange, setTimeRange] = useState('month');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start, end;
    switch (timeRange) {
      case 'day':
        start = now;
        end = now;
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }, [timeRange]);

  // Using Mock Data
  const filteredSales = MOCK_SALES;
  const filteredRevenues = MOCK_REVENUES;
  const allProducts = MOCK_PRODUCTS;
  const allRawMaterials = MOCK_RAW_MATERIALS;


  const { totalRevenue, grossProfit, salesCount, cmv } = useMemo(() => {
    const revenue = filteredRevenues?.reduce((acc, r) => acc + r.amount, 0) || 0;
    let costOfGoodsSold = 0;
    
    filteredSales?.forEach(sale => {
      const product = allProducts?.find(p => p.id === sale.productId);
      if (product) {
        costOfGoodsSold += product.finalCost * sale.quantity;
      }
    });

    const profit = (filteredSales?.reduce((acc, sale) => acc + (sale.unitPrice * sale.quantity), 0) || 0) - costOfGoodsSold;


    return {
      totalRevenue: revenue,
      grossProfit: profit,
      salesCount: filteredSales?.length || 0,
      cmv: costOfGoodsSold
    };
  }, [filteredRevenues, filteredSales, allProducts]);

  const detailedCmvData = useMemo(() => {
    if (!filteredSales || !allProducts) return [];
    return filteredSales.map(sale => {
      const product = allProducts.find(p => p.id === sale.productId);
      const flavor = product?.flavors.find(f => f.id === sale.flavorId);
      const cost = product ? product.finalCost : 0;
      return {
        ...sale,
        productName: product?.name || 'N/A',
        flavorName: flavor?.name || 'N/A',
        unitCost: cost,
        totalCost: cost * sale.quantity
      }
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredSales, allProducts]);

  const lowStockProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.flatMap(p => p.flavors.filter(f => f.stock <= 5).map(f => ({ ...p, flavorName: f.name, stock: f.stock })))
  }, [allProducts]);
  
  const lowStockRawMaterials = useMemo(() => {
    if (!allRawMaterials) return [];
    return allRawMaterials.filter(rm => rm.quantity <= rm.minStock);
  }, [allRawMaterials]);
  
  const salesAndProfitChartData = useMemo(() => {
    if (!filteredSales || !allProducts) return [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const data: { [key: string]: { sales: number; profit: number } } = {};

    days.forEach(day => {
        const formattedDate = format(day, 'dd/MM');
        data[formattedDate] = { sales: 0, profit: 0 };
    });
    
    filteredSales.forEach(sale => {
        const date = format(new Date(sale.date), 'dd/MM');
        const product = allProducts.find(p => p.id === sale.productId);
        if (data[date] && product) {
            const saleValue = sale.unitPrice * sale.quantity;
            const cost = product.finalCost * sale.quantity;
            data[date].sales += saleValue;
            data[date].profit += saleValue - cost;
        }
    });

    return Object.entries(data).map(([date, values]) => ({ date, ...values }));
}, [filteredSales, startDate, endDate, allProducts]);


  const topSellingProducts = useMemo(() => {
    if (!filteredSales || !allProducts) return [];
    const salesByProduct = filteredSales.reduce((acc, sale) => {
        const product = allProducts.find(p => p.id === sale.productId);
        if(product){
            acc[product.id!] = (acc[product.id!] || 0) + sale.quantity;
        }
        return acc;
    }, {} as {[key: string]: number});

    return Object.entries(salesByProduct)
        .sort(([,a],[,b]) => b - a)
        .slice(0,5)
        .map(([productId, quantity]) => ({
            product: allProducts.find(p => p.id === productId),
            quantity
        }));
  }, [filteredSales, allProducts]);

  const topProfitableProducts = useMemo(() => {
      if (!filteredSales || !allProducts) return [];
      const profitByProduct = filteredSales.reduce((acc, sale) => {
          const product = allProducts.find(p => p.id === sale.productId);
          if (product) {
              const profit = (sale.unitPrice - product.finalCost) * sale.quantity;
              acc[product.id!] = (acc[product.id!] || 0) + profit;
          }
          return acc;
      }, {} as { [key: string]: number });

      return Object.entries(profitByProduct)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([productId, profit]) => ({
              product: allProducts.find(p => p.id === productId),
              profit
          }));
  }, [filteredSales, allProducts]);

    const salesByPaymentMethod = useMemo(() => {
        if (!filteredRevenues) return [];
        const data = filteredRevenues.reduce((acc, sale) => {
            const method = sale.paymentMethod || 'N/A';
            acc[method] = (acc[method] || 0) + sale.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(data).map(([name, value]) => ({name, value}));
    }, [filteredRevenues]);


  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Análise</h1>
        <div className="flex items-center gap-2">
            <Button variant={timeRange === 'day' ? 'default' : 'outline'} onClick={() => setTimeRange('day')}>Diário</Button>
            <Button variant={timeRange === 'week' ? 'default' : 'outline'} onClick={() => setTimeRange('week')}>Semanal</Button>
            <Button variant={timeRange === 'month' ? 'default' : 'outline'} onClick={() => setTimeRange('month')}>Mensal</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(grossProfit)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{salesCount}</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-3">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">CMV (Custo Mercadoria Vendida)</CardTitle>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" size="sm">Ver CMV Detalhado</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>CMV Detalhado ({timeRange === 'month' ? 'Este Mês' : timeRange === 'week' ? 'Esta Semana' : 'Hoje'})</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Qtde.</TableHead>
                                            <TableHead>Custo Unit.</TableHead>
                                            <TableHead className="text-right">Custo Total (CMV)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {detailedCmvData.length > 0 ? detailedCmvData.map(sale => (
                                            <TableRow key={sale.id}>
                                                <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell>{sale.productName} ({sale.flavorName})</TableCell>
                                                <TableCell>{sale.quantity}</TableCell>
                                                <TableCell>{formatCurrency(sale.unitCost)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(sale.totalCost)}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">Nenhuma venda no período.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(cmv)}</p>
                    <p className="text-xs text-muted-foreground">Representa o custo total dos produtos vendidos no período.</p>
                </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Alertas de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="products">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="products">Produtos</TabsTrigger>
                        <TabsTrigger value="raw_materials">Insumos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="products" className="h-48 overflow-y-auto">
                        {lowStockProducts.length > 0 ? (
                           lowStockProducts.map(p => (
                            <div key={`${p.id}-${p.flavorName}`} className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="font-medium">{p.name} ({p.flavorName})</span>
                                <span className="text-destructive font-semibold">{p.stock} un.</span>
                            </div>
                           ))
                        ) : <p className="text-sm text-muted-foreground text-center pt-8">Nenhum produto com estoque baixo.</p> }
                    </TabsContent>
                    <TabsContent value="raw_materials" className="h-48 overflow-y-auto">
                        {lowStockRawMaterials.length > 0 ? (
                           lowStockRawMaterials.map(rm => (
                            <div key={rm.id} className="flex items-center justify-between text-sm py-2 border-b">
                                <span className="font-medium">{rm.description}</span>
                                <span className="text-destructive font-semibold">{rm.quantity} {rm.unit}</span>
                            </div>
                           ))
                        ) : <p className="text-sm text-muted-foreground text-center pt-8">Nenhum insumo com estoque baixo.</p> }
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Vendas e Lucro ({timeRange === 'month' ? 'Este Mês' : timeRange === 'week' ? 'Esta Semana' : 'Hoje'})</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesAndProfitChartData}>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Vendas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="profit" name="Lucro" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
            <CardHeader>
                <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
                <CardDescription>Por quantidade ({timeRange === 'month' ? 'Este Mês' : timeRange === 'week' ? 'Esta Semana' : 'Hoje'})</CardDescription>
            </CardHeader>
            <CardContent>
                 {topSellingProducts.map(({product, quantity}) => (
                    <div key={product?.id} className="flex items-center justify-between text-sm py-2 border-b">
                        <span className="font-medium">{product?.name}</span>
                        <span className="font-semibold">{quantity} un.</span>
                    </div>
                ))}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Top 5 Produtos Mais Lucrativos</CardTitle>
                <CardDescription>Por lucro total ({timeRange === 'month' ? 'Este Mês' : timeRange === 'week' ? 'Esta Semana' : 'Hoje'})</CardDescription>
            </CardHeader>
            <CardContent>
                {topProfitableProducts.map(({product, profit}) => (
                    <div key={product?.id} className="flex items-center justify-between text-sm py-2 border-b">
                        <span className="font-medium">{product?.name}</span>
                        <span className="font-semibold text-green-600">{formatCurrency(profit)}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento</CardTitle>
                 <CardDescription>({timeRange === 'month' ? 'Este Mês' : timeRange === 'week' ? 'Esta Semana' : 'Hoje'})</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={salesByPaymentMethod} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                             {salesByPaymentMethod.map((entry, index) => (
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
    </div>
  );
}
