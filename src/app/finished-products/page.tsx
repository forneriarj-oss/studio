'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import type { FinishedProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function ProductsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const finishedProductsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/finished-products`) : null),
    [firestore, user]
  );
  const { data: products, isLoading } = useCollection<FinishedProduct>(finishedProductsRef);
  
  const [filterCategory, setFilterCategory] = useState('todos');
  const { toast } = useToast();
  const router = useRouter();

  const categories = useMemo(() => {
    if (!products) return ['todos'];
    const allCategories = products.map(p => p.category).filter(Boolean); // Filter out undefined/null categories
    return ['todos', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (filterCategory === 'todos') {
      return products;
    }
    return products.filter(p => p.category === filterCategory);
  }, [products, filterCategory]);

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/finished-products`, productId);
    await deleteDoc(docRef);
    toast({
      title: 'Produto Excluído',
      description: 'O produto foi removido da sua lista.',
    });
  };

  const totalStockByProduct = (product: FinishedProduct) => {
    if (!product.flavors) return 0;
    return product.flavors.reduce((total, flavor) => total + flavor.stock, 0);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus produtos acabados, estoque e preços.</p>
        </div>
        <Button asChild>
          <Link href="/finished-products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrar por Categoria:</span>
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
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                  {isLoading && (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                          Carregando produtos...
                          </TableCell>
                      </TableRow>
                  )}
                  {!isLoading && filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                       <TableRow key={product.id!}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{`${totalStockByProduct(product)} ${product.unit}`}</TableCell>
                          <TableCell>{formatCurrency(product.finalCost)}</TableCell>
                          <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                          <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
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
                                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto e todos os seus sabores/variações.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProduct(product.id!)}>Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                              </AlertDialog>
                          </div>
                          </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    !isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum produto encontrado. <Link href="/finished-products/new" className="text-primary underline">Crie seu primeiro produto!</Link>
                            </TableCell>
                        </TableRow>
                    )
                  )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
