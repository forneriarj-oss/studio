
'use client';
import { useState, useMemo, useEffect } from 'react';
import { getFinishedProducts, updateStock } from '@/lib/data';
import type { Sale, FinishedProduct, PaymentMethod, Flavor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) {
      return 'R$ NaN';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};


export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<FinishedProduct[]>(getFinishedProducts());
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newSale, setNewSale] = useState({
        productId: '',
        flavorId: '',
        quantity: 1,
        unitPrice: 0,
        date: '',
        paymentMethod: 'PIX' as PaymentMethod,
        commission: 0,
    });
    
    useEffect(() => {
        setIsClient(true);
        setNewSale(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }, []);


    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    }
    
    const getFlavor = (product: FinishedProduct | undefined, flavorId: string): Flavor | undefined => {
        return product?.flavors.find(f => f.id === flavorId);
    }

    const handleAddSale = () => {
        const product = products.find(p => p.id === newSale.productId);
        const flavor = getFlavor(product, newSale.flavorId);

        if (!newSale.productId || !newSale.flavorId || newSale.quantity <= 0 || newSale.unitPrice < 0) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, preencha todos os campos corretamente.',
            });
            return;
        }

        if (!product || !flavor || flavor.stock < newSale.quantity) {
             toast({
                variant: 'destructive',
                title: 'Erro de Estoque',
                description: 'Quantidade em estoque insuficiente para este sabor.',
            });
            return;
        }

        const saleToAdd: Sale = {
            id: `sale-${Date.now()}`,
            ...newSale
        };

        const updatedStock = updateStock(newSale.productId, newSale.quantity, 'out', newSale.flavorId);
        
        if (updatedStock) {
            setSales(prev => [saleToAdd, ...prev]);
            setProducts(prevProducts => prevProducts.map(p => 
                p.id === newSale.productId ? { ...p, flavors: p.flavors.map(f => f.id === newSale.flavorId ? {...f, stock: f.stock - newSale.quantity} : f) } : p
            ));

             toast({
                title: 'Venda registrada!',
                description: `Estoque do produto atualizado.`,
            });
            
            setIsDialogOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível atualizar o estoque.',
            });
        }
    }

    const openSaleDialog = (product: FinishedProduct) => {
        setNewSale({
            productId: product.id,
            flavorId: '',
            quantity: 1,
            unitPrice: product.salePrice,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'PIX',
            commission: 0,
        });
        setIsDialogOpen(true);
    };
    
    const totalStockByProduct = (product: FinishedProduct) => {
      return product.flavors.reduce((total, flavor) => total + flavor.stock, 0);
    }

    const selectedProductForDialog = getProduct(newSale.productId);
    
    if (!isClient) {
        return null;
    }

  return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Realizar uma Venda</CardTitle>
                    <CardDescription>Selecione um produto da lista para registrar uma nova venda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Estoque Total</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => {
                                const totalStock = totalStockByProduct(product);
                                return (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{totalStock}</TableCell>
                                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant={totalStock > 0 ? "default" : "secondary"}
                                            disabled={totalStock <= 0}
                                            onClick={() => totalStock > 0 && openSaleDialog(product)}
                                            className={totalStock > 0 ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            {totalStock > 0 ? 'Vender' : 'Sem Estoque'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
                <DialogDescription>Preencha os detalhes abaixo para registrar a venda de {selectedProductForDialog?.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="flavor">Sabor</Label>
                        <Select onValueChange={(value) => setNewSale({...newSale, flavorId: value})} value={newSale.flavorId}>
                            <SelectTrigger id="flavor">
                                <SelectValue placeholder="Selecione um sabor" />
                            </SelectTrigger>
                            <SelectContent>
                            {selectedProductForDialog?.flavors.map(flavor => (
                                <SelectItem key={flavor.id} value={flavor.id} disabled={flavor.stock <= 0}>
                                    {flavor.name} (Estoque: {flavor.stock})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input id="quantity" type="number" value={newSale.quantity} onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="unitPrice">Preço Unitário</Label>
                         <Input id="unitPrice" type="number" value={newSale.unitPrice} onChange={(e) => setNewSale({...newSale, unitPrice: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                        <Select onValueChange={(value) => setNewSale({...newSale, paymentMethod: value as PaymentMethod})} defaultValue={newSale.paymentMethod}>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="commission">Comissão (%)</Label>
                        <Input id="commission" type="number" value={newSale.commission} onChange={(e) => setNewSale({...newSale, commission: parseFloat(e.target.value) || 0})} placeholder="ex: 5" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Data da Venda</Label>
                        <Input id="date" type="date" value={newSale.date} onChange={(e) => setNewSale({...newSale, date: e.target.value})} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddSale}>Salvar Venda</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
