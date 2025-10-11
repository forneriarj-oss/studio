'use client';
import Link from 'next/link';
import { useState } from 'react';
import { getFinishedProducts } from '@/lib/data';
import type { FinishedProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Wand } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function FinishedProductsPage() {
  const [products, setProducts] = useState<FinishedProduct[]>(getFinishedProducts());

  const totalStockByProduct = (product: FinishedProduct) => {
    return product.flavors.reduce((total, flavor) => total + flavor.stock, 0);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/finished-products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Gerencie seus produtos cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">Filtrar por Categoria:</span>
            <Select defaultValue="todos">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="bolo">Bolo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque Total</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                 <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name.toUpperCase()}</TableCell>
                    <TableCell>{product.category.toUpperCase()}</TableCell>
                    <TableCell>{`${totalStockByProduct(product)} ${product.unit}`}</TableCell>
                    <TableCell>{formatCurrency(product.finalCost)}</TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                            <Wand className="mr-2 h-4 w-4" />
                            Produzir
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                    </div>
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
