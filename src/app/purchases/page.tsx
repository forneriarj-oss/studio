
'use client';
import { useState } from 'react';
import { getPurchases, getProducts, updateStock } from '@/lib/data';
import type { Purchase, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const initialPurchases = getPurchases();
const initialProducts = getProducts();

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const { toast } = useToast();
    const [newPurchase, setNewPurchase] = useState({
        productId: '',
        quantity: 1,
        unitCost: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const handleAddPurchase = () => {
        if (!newPurchase.productId || newPurchase.quantity <= 0 || newPurchase.unitCost < 0) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, preencha todos os campos corretamente.',
            });
            return;
        }

        const purchaseToAdd: Purchase = {
            id: `purch-${Date.now()}`,
            ...newPurchase
        };

        const updatedStock = updateStock(newPurchase.productId, newPurchase.quantity, 'in');

        if (updatedStock) {
            setPurchases(prev => [...prev, purchaseToAdd]);
            
            setProducts(prevProducts => prevProducts.map(p => 
                p.id === newPurchase.productId ? { ...p, quantity: p.quantity + newPurchase.quantity } : p
            ));
            
            toast({
                title: 'Compra registrada!',
                description: `Estoque do produto atualizado.`,
            });

            // Reset form
            setNewPurchase({
                productId: '',
                quantity: 1,
                unitCost: 0,
                date: new Date().toISOString().split('T')[0]
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível atualizar o estoque.',
            });
        }
    }

    const getProductDescription = (productId: string) => {
        return products.find(p => p.id === productId)?.description || 'Produto não encontrado';
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
         <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">Produto</Label>
                    <Select onValueChange={(value) => setNewPurchase({...newPurchase, productId: value})}>
                        <SelectTrigger id="product" className="col-span-3">
                            <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                        {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>{product.description}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                  <Input id="quantity" type="number" value={newPurchase.quantity} onChange={(e) => setNewPurchase({...newPurchase, quantity: parseInt(e.target.value) || 1})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitCost" className="text-right">Custo Unit.</Label>
                  <Input id="unitCost" type="number" value={newPurchase.unitCost} onChange={(e) => setNewPurchase({...newPurchase, unitCost: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Data</Label>
                  <Input id="date" type="date" value={newPurchase.date} onChange={(e) => setNewPurchase({...newPurchase, date: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleAddPurchase}>Salvar Compra</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Todas as compras de produtos registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(purchase => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{getProductDescription(purchase.productId)}</TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{purchase.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.unitCost)}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    - {formatCurrency(purchase.quantity * purchase.unitCost)}
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
