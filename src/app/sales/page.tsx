
'use client';
import { useState, useMemo } from 'react';
import { getSales, getRawMaterials, updateStock } from '@/lib/data';
import type { Sale, RawMaterial, PaymentMethod } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Calculator, Info } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const initialSales = getSales();
const initialProducts = getRawMaterials();
const paymentMethods: PaymentMethod[] = ['PIX', 'Cartão', 'Dinheiro'];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};

function PricingCalculator({ product, onPriceCalculated }: { product: RawMaterial | undefined, onPriceCalculated: (price: number) => void }) {
    const [taxPercent, setTaxPercent] = useState(10);
    const [feePercent, setFeePercent] = useState(5);
    const [profitMargin, setProfitMargin] = useState(30);

    const suggestedPrice = useMemo(() => {
        if (!product) return 0;
        const cost = product.cost;
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
                 <CardDescription>Calcule o preço de venda ideal para '{product?.description}'.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="p-4 rounded-md bg-muted">
                    <Label>Preço de Custo do Produto</Label>
                    <p className="text-2xl font-bold">{formatCurrency(product?.cost || 0)}</p>
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
    const [products, setProducts] = useState<RawMaterial[]>(initialProducts);
    const { toast } = useToast();
    const [newSale, setNewSale] = useState({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'PIX' as PaymentMethod,
        commission: 0,
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

    const getProduct = (productId: string) => {
        return products.find(p => p.id === productId);
    }
    
    const calculateNetProfit = (sale: Sale) => {
        const product = getProduct(sale.productId);
        if (!product) return 0;
    
        const totalSalePrice = sale.quantity * sale.unitPrice;
        const totalCostPrice = sale.quantity * product.cost;
        const commissionAmount = totalSalePrice * ((sale.commission || 0) / 100);
    
        return totalSalePrice - totalCostPrice - commissionAmount;
    };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Vendas de Produtos Acabados</h1>
           <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Registrar Venda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Venda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto</Label>
                      <Select onValueChange={(value) => {
                          const product = products.find(p => p.id === value);
                          setNewSale({...newSale, productId: value, unitPrice: product?.cost ? product.cost * 1.3 : 0 });
                      }}>
                          <SelectTrigger id="product">
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
                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Venda</Label>
                    <Input id="date" type="date" value={newSale.date} onChange={(e) => setNewSale({...newSale, date: e.target.value})} />
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
                {sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => {
                  const total = sale.quantity * sale.unitPrice;
                  const netProfit = calculateNetProfit(sale);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{getProduct(sale.productId)?.description || 'N/A'}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.unitPrice)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
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

    


    