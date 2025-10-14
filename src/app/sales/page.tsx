'use client';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Sale, FinishedProduct, PaymentMethod, Flavor, Revenue } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirebase, useCollection } from '@/firebase';
import { collection, doc, runTransaction, addDoc, query, where } from 'firebase/firestore';
import { Loader } from 'lucide-react';

const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];
const saleLocations = ['Balcão', 'iFood', 'Delivery'];

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

export default function SalesPage() {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();

    const productsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'finished-products'), where('userId', '==', user.uid));
    }, [user, firestore]);
    
    const salesQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'sales'), where('userId', '==', user.uid));
    }, [user, firestore]);

    const { data: products, isLoading: isLoadingProducts, error: productsError } = useCollection<FinishedProduct>(productsQuery);
    const { data: sales, isLoading: isLoadingSales, error: salesError } = useCollection<Sale>(salesQuery);
    
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, startTransition] = useTransition();

    const [newSale, setNewSale] = useState({
        productId: '',
        flavorId: '',
        quantity: 1,
        unitPrice: 0,
        date: '',
        paymentMethod: 'PIX' as PaymentMethod,
        commission: 0,
        location: 'Balcão'
    });
    const [deliveryFee, setDeliveryFee] = useState(0);
    
    useEffect(() => {
        setIsClient(true);
        if(!isDialogOpen) {
          setNewSale(prev => ({ 
              ...prev, 
              date: new Date().toISOString().split('T')[0],
              location: 'Balcão',
              quantity: 1
          }));
          setDeliveryFee(0);
        }
    }, [isDialogOpen]);

    const getProduct = (productId: string) => {
        return products?.find(p => p.id === productId);
    }
    
    const selectedProductForDialog = useMemo(() => getProduct(newSale.productId), [newSale.productId, products]);

    const { finalSalePrice, saleUnitPrice } = useMemo(() => {
        if (!selectedProductForDialog) return { finalSalePrice: 0, saleUnitPrice: 0 };
      
        let basePrice = selectedProductForDialog.salePrice;
        if (newSale.location === 'iFood') {
          basePrice *= 1.75; // 75% markup for iFood
        }
      
        let total = basePrice * newSale.quantity;
      
        if (newSale.location === 'Delivery') {
          total += deliveryFee;
        }
      
        return { finalSalePrice: total, saleUnitPrice: basePrice };
      }, [newSale.quantity, newSale.location, deliveryFee, selectedProductForDialog]);
      
      useEffect(() => {
        if (saleUnitPrice !== newSale.unitPrice) {
          setNewSale(prev => ({...prev, unitPrice: saleUnitPrice }));
        }
      }, [saleUnitPrice, newSale.unitPrice]);


    const getFlavor = (product: FinishedProduct | undefined, flavorId: string): Flavor | undefined => {
        return product?.flavors.find(f => f.id === flavorId);
    }

    const handleAddSale = async () => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            return;
        }

        const product = getProduct(newSale.productId);
        const flavor = getFlavor(product, newSale.flavorId);

        if (!newSale.productId || !newSale.flavorId || newSale.quantity <= 0 ) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todos os campos corretamente.' });
            return;
        }

        if (!product || !flavor || flavor.stock < newSale.quantity) {
             toast({ variant: 'destructive', title: 'Erro de Estoque', description: 'Quantidade em estoque insuficiente para este sabor.' });
            return;
        }
        
        startTransition(async () => {
            try {
                const productRef = doc(firestore, 'finished-products', newSale.productId);
                
                // Firestore Transaction
                await runTransaction(firestore, async (transaction) => {
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists()) {
                        throw new Error("Produto não encontrado!");
                    }
                    
                    const currentProductData = productDoc.data() as FinishedProduct;
                    const newFlavors = currentProductData.flavors.map(f => {
                        if (f.id === newSale.flavorId) {
                            if (f.stock < newSale.quantity) {
                                throw new Error(`Estoque insuficiente para o sabor ${f.name}.`);
                            }
                            return { ...f, stock: f.stock - newSale.quantity };
                        }
                        return f;
                    });
                    
                    transaction.update(productRef, { flavors: newFlavors });

                    // Add to sales subcollection
                    const salesCollectionRef = collection(firestore, 'sales');
                    const saleToAdd: Omit<Sale, 'id'> = {
                        ...newSale,
                        userId: user.uid,
                        date: new Date().toISOString(),
                    };
                    transaction.set(doc(salesCollectionRef), saleToAdd);

                    // Add to revenues subcollection
                    const revenueCollectionRef = collection(firestore, 'revenues');
                     const revenueToAdd: Omit<Revenue, 'id'> = {
                        userId: user.uid,
                        amount: finalSalePrice,
                        source: `Venda: ${product.name} (${flavor.name})`,
                        date: new Date().toISOString(),
                        paymentMethod: newSale.paymentMethod
                    };
                    transaction.set(doc(revenueCollectionRef), revenueToAdd);
                });

                toast({
                    title: 'Venda registrada!',
                    description: `Estoque do produto atualizado e receita registrada.`,
                });
                setIsDialogOpen(false);
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Falha na Transação',
                    description: error.message || 'Não foi possível registrar a venda. Tente novamente.',
                });
            }
        });
    }

    const openSaleDialog = (product: FinishedProduct) => {
        setNewSale({
            productId: product.id!,
            flavorId: '',
            quantity: 1,
            unitPrice: product.salePrice,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'PIX',
            commission: 0,
            location: 'Balcão'
        });
        setDeliveryFee(0);
        setIsDialogOpen(true);
    };
    
    const totalStockByProduct = (product: FinishedProduct) => {
      if (!product.flavors) return 0;
      return product.flavors.reduce((total, flavor) => total + flavor.stock, 0);
    }
    
    if (!isClient || isUserLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin" /></div>;
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
                            {isLoadingProducts && <TableRow><TableCell colSpan={4} className="text-center h-24">Carregando produtos...</TableCell></TableRow>}
                            {!isLoadingProducts && products?.map(product => {
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
                             {!isLoadingProducts && products?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Nenhum produto cadastrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                    <CardDescription>Últimas 50 vendas registradas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Qtde</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingSales && <TableRow><TableCell colSpan={5} className="h-24 text-center">Carregando histórico...</TableCell></TableRow>}
                            {!isLoadingSales && sales?.map(sale => {
                                const product = getProduct(sale.productId);
                                const flavor = getFlavor(product, sale.flavorId);
                                return (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <div className="font-medium">{product?.name || 'Produto não encontrado'}</div>
                                            <div className="text-sm text-muted-foreground">{flavor?.name || 'Sabor não encontrado'}</div>
                                        </TableCell>
                                        <TableCell>{new Date(sale.date).toLocaleString('pt-BR')}</TableCell>
                                        <TableCell>{sale.quantity}</TableCell>
                                        <TableCell><Badge variant="outline">{sale.location}</Badge></TableCell>
                                        <TableCell className="text-right">{formatCurrency(sale.unitPrice * sale.quantity)}</TableCell>
                                    </TableRow>
                                )
                            })}
                            {!isLoadingSales && sales?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhuma venda registrada ainda.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="uppercase">Registrar Venda: {selectedProductForDialog?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <Label htmlFor="flavor" className="text-right">Sabor</Label>
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

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                  <Input id="quantity" type="number" value={newSale.quantity} onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})} min="1"/>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <Label htmlFor="paymentMethod" className="text-right">Método</Label>
                  <Select onValueChange={(value) => setNewSale({...newSale, paymentMethod: value as PaymentMethod})} defaultValue={newSale.paymentMethod}>
                  <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Selecione o pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                      {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <Label htmlFor="location" className="text-right">Local</Label>
                  <Select onValueChange={(value) => setNewSale({...newSale, location: value})} value={newSale.location}>
                  <SelectTrigger id="location">
                      <SelectValue placeholder="Selecione o local da venda" />
                  </SelectTrigger>
                  <SelectContent>
                      {saleLocations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
              </div>

              {newSale.location === 'Delivery' && (
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <Label htmlFor="delivery-fee" className="text-right">Taxa Entrega</Label>
                    <Input id="delivery-fee" type="number" placeholder="Ex: 5.00" value={deliveryFee} onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)} />
                </div>
              )}
            
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(newSale.unitPrice * newSale.quantity)}</span>
                </div>
                 {newSale.location === 'iFood' && (
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>(Preço base: {formatCurrency(selectedProductForDialog?.salePrice || 0)})</span>
                        <span>+75% iFood</span>
                    </div>
                )}
                 {newSale.location === 'Delivery' && deliveryFee > 0 && (
                    <div className="flex justify-between items-center">
                        <span>Taxa de Entrega</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(finalSalePrice)}</span>
                </div>
              </div>

            </div>
            <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddSale} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Venda
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
