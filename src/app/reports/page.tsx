
'use client';
import { getStockMovements, getRawMaterials, getSales } from '@/lib/data';
import type { StockMovement, RawMaterial } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useMemo } from 'react';

const stockMovements = getStockMovements();
const products = getRawMaterials();
const sales = getSales();

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

export default function ReportsPage() {

    const getProductInfo = (productId: string): RawMaterial | undefined => {
        return products.find(p => p.id === productId);
    }

    const recentMovements = stockMovements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
    
    const topSellingProducts = useMemo(() => {
        const productSales: { [key: string]: { quantity: number; total: number; profit: number; product: RawMaterial } } = {};

        sales.forEach(sale => {
            const product = getProductInfo(sale.productId);
            if (product) {
                if (!productSales[sale.productId]) {
                    productSales[sale.productId] = { quantity: 0, total: 0, profit: 0, product };
                }
                const saleTotal = sale.quantity * sale.unitPrice;
                const saleCost = sale.quantity * product.cost;
                const commission = saleTotal * ((sale.commission || 0) / 100);
                
                productSales[sale.productId].quantity += sale.quantity;
                productSales[sale.productId].total += saleTotal;
                productSales[sale.productId].profit += saleTotal - saleCost - commission;
            }
        });
        
        return Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
    }, []);

  return (
    <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h1>

        <Card>
            <CardHeader>
                <CardTitle>Matérias-Primas Mais Vendidas e Rentáveis</CardTitle>
                <CardDescription>Ranking de suas matérias-primas com base na quantidade vendida e lucratividade.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Matéria-Prima</TableHead>
                            <TableHead className="text-right">Quantidade Vendida</TableHead>
                            <TableHead className="text-right">Total em Vendas</TableHead>
                            <TableHead className="text-right">Lucro Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSellingProducts.map(({product, quantity, total, profit}) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.description}</TableCell>
                            <TableCell className="text-right font-semibold">{quantity}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">{formatCurrency(total)}</TableCell>
                            <TableCell className={`text-right font-semibold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(profit)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Movimentação Recente de Estoque</CardTitle>
                <CardDescription>Um registro das entradas e saídas mais recentes do seu estoque de matérias-primas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Matéria-Prima</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentMovements.map(movement => (
                    <TableRow key={movement.id}>
                        <TableCell className="font-medium">{getProductInfo(movement.productId)?.description || 'Matéria-prima não encontrada'}</TableCell>
                        <TableCell>{new Date(movement.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                            {movement.type === 'in' ? (
                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                    <ArrowUp className="mr-1 h-4 w-4" />
                                    Entrada
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                    <ArrowDown className="mr-1 h-4 w-4" />
                                    Saída
                                </Badge>
                            )}
                        </TableCell>
                         <TableCell className="capitalize">{
                            {
                                sale: 'Venda',
                                purchase: 'Compra',
                                initial: 'Inicial',
                                production: 'Produção'
                            }[movement.source]
                         }</TableCell>
                        <TableCell className={`text-right font-semibold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
