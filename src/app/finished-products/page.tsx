'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getFinishedProducts } from '@/lib/data';
import type { FinishedProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Wand } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<FinishedProduct[]>(getFinishedProducts());
  const [filterCategory, setFilterCategory] = useState('todos');
  const { toast } = useToast();
  const router = useRouter();

  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return ['todos', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (filterCategory === 'todos') {
      return products;
    }
    return products.filter(p => p.category === filterCategory);
  }, [products, filterCategory]);

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({
      title: 'Produto Excluído',
      description: 'O produto foi removido da sua lista.',
    });
  };

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
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                   <SelectItem key={cat} value={cat}>{cat === 'todos' ? 'Todas' : cat}</SelectItem>
                ))}
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
              {filteredProducts.map(product => (
                 <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name.toUpperCase()}</TableCell>
                    <TableCell>{product.category.toUpperCase()}</TableCell>
                    <TableCell>{`${totalStockByProduct(product)} ${product.unit}`}</TableCell>
                    <TableCell>{formatCurrency(product.finalCost)}</TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Em breve!', description: 'Funcionalidade de produção em desenvolvimento.'})}>
                            <Wand className="mr-2 h-4 w-4" />
                            Produzir
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/finished-products/edit/${product.id}`)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
