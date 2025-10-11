
'use client';
import { useState } from 'react';
import { getSales, getProducts, updateStock } from '@/lib/data';
import type { Sale, Product } from '@/lib/types';
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


const initialSales = getSales();
const initialProducts = getProducts();

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const { toast } = useToast();
    const [newSale, setNewSale] = useState({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const handleAddSale = () => {
        const product = products.find(p => p.id === newSale.productId);

        if (!newSale.productId || newSale.quantity <= 0 || newSale.unitPrice < 0) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, preencha todos os campos corretamente.',
            });
            return;
        }

        if (!product || product.quantity < newSale.quantity) {
             toast({
                variant: 'destructive',
                title: 'Erro de Estoque',
                description: 'Quantidade em estoque insuficiente para esta venda.',
            });
            return;
        }

        const saleToAdd: Sale = {
            id: `sale-${Date.now()}`,
            ...newSale
        };

        const updatedStock = updateStock(newSale.productId, newSale.quantity, 'out');
        
        if (updatedStock) {
            setSales(prev => [...prev, saleToAdd]);
            setProducts(prevProducts => prevProducts.map(p => 
                p.id === newSale.productId ? { ...p, quantity: p.quantity - newSale.quantity } : p
            ));

             toast({
                title: 'Venda registrada!',
                description: `Estoque do produto atualizado.`,
            });
            
            // Reset form
            setNewSale({
                productId: '',
                quantity: 1,
                unitPrice: 0,
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
        <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
         <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">Produto</Label>
                    <Select onValueChange={(value) => {
                        const product = products.find(p => p.id === value);
                        setNewSale({...newSale, productId: value, unitPrice: product?.cost ? product.cost * 1.3 : 0 });
                    }}>
                        <SelectTrigger id="product" className="col-span-3">
                            <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                        {products.map(product => (
                            <SelectItem key={product.id} value={product.id} disabled={product.quantity <= 0}>
                                {product.description} {product.quantity <= 0 && '(Sem estoque)'}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                  <Input id="quantity" type="number" value={newSale.quantity} onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitPrice" className="text-right">Preço Unit.</Label>
                  <Input id="unitPrice" type="number" value={newSale.unitPrice} onChange={(e) => setNewSale({...newSale, unitPrice: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Data</Label>
                  <Input id="date" type="date" value={newSale.date} onChange={(e) => setNewSale({...newSale, date: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleAddSale}>Salvar Venda</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Todas as vendas registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{getProductDescription(sale.productId)}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.unitPrice)}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(sale.quantity * sale.unitPrice)}
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
