
'use client';
import { getStockMovements, getProducts } from '@/lib/data';
import type { StockMovement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

const stockMovements = getStockMovements();
const products = getProducts();


export default function ReportsPage() {

    const getProductDescription = (productId: string) => {
        return products.find(p => p.id === productId)?.description || 'Produto não encontrado';
    }

    const recentMovements = stockMovements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <Card>
            <CardHeader>
                <CardTitle>Movimentação de Estoque</CardTitle>
                <CardDescription>Um registro das entradas e saídas mais recentes do seu estoque.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentMovements.map(movement => (
                    <TableRow key={movement.id}>
                        <TableCell className="font-medium">{getProductDescription(movement.productId)}</TableCell>
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
                                initial: 'Inicial'
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
