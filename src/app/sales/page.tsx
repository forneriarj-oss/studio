
'use client';
import { useState, useMemo } from 'react';
import { getSales, getFinishedProducts, updateStock } from '@/lib/data';
import type { Sale, FinishedProduct, PaymentMethod, Flavor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Calculator, Info, DollarSign, ShoppingCart, BarChart } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const initialSales = getSales();
const initialProducts = getFinishedProducts();
const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

function PricingCalculator({ product, onPriceCalculated }: { product: FinishedProduct | undefined, onPriceCalculated: (price: number) => void }) {
    const [taxPercent, setTaxPercent] = useState(10);
    const [feePercent, setFeePercent] = useState(5);
    const [profitMargin, setProfitMargin] = useState(30);

    const suggestedPrice = useMemo(() => {
        if (!product) return 0;
        const cost = product.finalCost;
        const taxes = cost * (taxPercent / 100);
        const fees = cost * (feePercent / 100);
        
        if (1 - (profitMargin / 100) === 0) return Infinity;
        
        const finalPrice = (cost + taxes + fees) / (1 - (profitMargin / 100));
        return finalPrice;
    }, [product, taxPercent, feePercent, profitMargin]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Calculadora de Precificação Inteligente</DialogTitle>
                 <DialogDescription>Calcule o preço de venda ideal para '{product?.name}'.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="p-4 rounded-md bg-muted">
                    <Label>Preço de Custo do Produto</Label>
                    <p className="text-2xl font-bold">{formatCurrency(product?.finalCost || 0)}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taxPercent">Impostos (ICMS, PIS, etc.) (%)</Label>
                    <Input id="taxPercent" type="number" value={taxPercent} onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="feePercent">Taxas de Plataforma/Cartão (%)</Label>
                    <Input id="feePercent" type="number" value={feePercent} onChange={e => setFeePercent(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="profitMargin">Margem de Lucro Desejada (%)</Label>
                    <Input id="profitMargin" type="number" value={profitMargin} onChange={e => setProfitMargin(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="p-4 rounded-md border text-center">
                    <Label>Preço de Venda Sugerido</Label>
                    <p className="text-3xl font-bold text-primary">{isFinite(suggestedPrice) ? formatCurrency(suggestedPrice) : 'Inválido'}</p>
                    <p className='text-xs text-muted-foreground'>(Custo + Impostos + Taxas) / (1 - Margem de Lucro)</p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={() => onPriceCalculated(suggestedPrice)}>Usar este Preço</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}


export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>(initialSales);
    const [products, setProducts] = useState<FinishedProduct[]>(initialProducts);
    const { toast } = useToast();
    const [newSale, setNewSale] = useState({
        productId: '',
        flavorId: '',
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'PIX' as PaymentMethod,
        commission: 0,
    });

    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    }
    
    const getFlavor = (product: FinishedProduct | undefined, flavorId: string): Flavor | undefined => {
        return product?.flavors.find(f => f.id === flavorId);
    }

    const calculateNetProfit = (sale: Sale) => {
        const product = getProduct(sale.productId);
        if (!product) return 0;
    
        const totalSalePrice = sale.quantity * sale.unitPrice;
        const totalCostPrice = sale.quantity * product.finalCost;
        const commissionAmount = totalSalePrice * ((sale.commission || 0) / 100);
    
        return totalSalePrice - totalCostPrice - commissionAmount;
    };

    const salesSummary = useMemo(() => {
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.quantity * sale.unitPrice, 0);
        const totalNetProfit = sales.reduce((acc, sale) => acc + calculateNetProfit(sale), 0);
        const totalSales = sales.length;
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
            totalRevenue,
            totalNetProfit,
            totalSales,
            averageTicket
        }
    }, [sales]);

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
            
            // Reset form
            setNewSale({
                productId: '',
                flavorId: '',
                quantity: 1,
                unitPrice: 0,
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'PIX',
                commission: 0,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível atualizar o estoque.',
            });
        }
    }

    const selectedProduct = getProduct(newSale.productId);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Vendas de Produtos Acabados</h1>
           <Dialog onOpenChange={(open) => !open && setNewSale({ productId: '', flavorId: '', quantity: 1, unitPrice: 0, date: new Date().toISOString().split('T')[0], paymentMethod: 'PIX', commission: 0 })}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Registrar Venda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Venda</DialogTitle>
                   <DialogDescription>Preencha os detalhes abaixo para registrar uma nova venda.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="product">Produto</Label>
                        <Select onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            setNewSale({...newSale, productId: value, flavorId: '', unitPrice: product?.salePrice || 0 });
                        }}>
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                            {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProduct && (
                        <div className="space-y-2">
                            <Label htmlFor="flavor">Sabor</Label>
                            <Select onValueChange={(value) => setNewSale({...newSale, flavorId: value})} value={newSale.flavorId}>
                                <SelectTrigger id="flavor">
                                    <SelectValue placeholder="Selecione um sabor" />
                                </SelectTrigger>
                                <SelectContent>
                                {selectedProduct.flavors.map(flavor => (
                                    <SelectItem key={flavor.id} value={flavor.id} disabled={flavor.stock <= 0}>
                                        {flavor.name} (Estoque: {flavor.stock})
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input id="quantity" type="number" value={newSale.quantity} onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unitPrice">Preço Unitário</Label>
                        <div className="flex items-center gap-2">
                        <Input id="unitPrice" type="number" value={newSale.unitPrice} onChange={(e) => setNewSale({...newSale, unitPrice: parseFloat(e.target.value) || 0})} className="flex-1" />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" disabled={!newSale.productId}>
                                    <Calculator className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            {newSale.productId && (
                                <PricingCalculator 
                                    product={products.find(p => p.id === newSale.productId)}
                                    onPriceCalculated={(price) => setNewSale({...newSale, unitPrice: parseFloat(price.toFixed(2))})}
                                />
                            )}
                        </Dialog>
                        </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                     <div className="space-y-2">
                        <Label htmlFor="commission">Comissão (%)</Label>
                        <Input id="commission" type="number" value={newSale.commission} onChange={(e) => setNewSale({...newSale, commission: parseFloat(e.target.value) || 0})} placeholder="ex: 5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Venda</Label>
                    <Input id="date" type="date" value={newSale.date} onChange={(e) => setNewSale({...newSale, date: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                   <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit" onClick={handleAddSale}>Salvar Venda</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesSummary.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Receita bruta de todas as vendas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(salesSummary.totalNetProfit)}</div>
                     <p className="text-xs text-muted-foreground">Receita após custos e comissões</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{salesSummary.totalSales}</div>
                    <p className="text-xs text-muted-foreground">Total de transações de venda</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesSummary.averageTicket)}</div>
                    <p className="text-xs text-muted-foreground">Valor médio por transação</p>
                </CardContent>
            </Card>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>Todas as vendas de produtos acabados registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Qtde.</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                   <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Lucro Líquido
                       <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>(Venda Total) - (Custo Total) - (Comissão)</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(sale => {
                  const total = sale.quantity * sale.unitPrice;
                  const netProfit = calculateNetProfit(sale);
                  const product = getProduct(sale.productId);
                  const flavorName = getFlavor(product, sale.flavorId || '')?.name;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {product?.name || 'N/A'}
                        {flavorName && <span className='text-muted-foreground text-xs ml-1'>({flavorName})</span>}
                        </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.unitPrice)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(netProfit)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
