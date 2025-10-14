
'use client';
import { useState, useMemo } from 'react';
import type { Purchase, RawMaterial } from '@/lib/types';
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useUser, useCollection, useFirebase } from '@/firebase';
import { collection, runTransaction, doc, addDoc, serverTimestamp } from 'firebase/firestore';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
};


export default function PurchasesPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { firestore } = useFirebase();
    
    const purchasesQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'purchases');
    }, [user, firestore]);
    const { data: purchases, isLoading: isLoadingPurchases } = useCollection<Purchase>(purchasesQuery);
    
    const rawMaterialsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'raw-materials');
    }, [user, firestore]);
    const { data: rawMaterials, isLoading: isLoadingMaterials } = useCollection<RawMaterial>(rawMaterialsQuery);


    const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
    const [newPurchase, setNewPurchase] = useState({
        rawMaterialId: '',
        quantity: 1,
        unitCost: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const handleAddPurchase = async () => {
        if (!newPurchase.rawMaterialId || newPurchase.quantity <= 0 || newPurchase.unitCost < 0) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, preencha todos os campos corretamente.',
            });
            return;
        }

        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            return;
        }
        
        try {
            const rawMaterialRef = doc(firestore, 'users', user.uid, 'raw-materials', newPurchase.rawMaterialId);
            const purchasesRef = collection(firestore, 'users', user.uid, 'purchases');

            await runTransaction(firestore, async (transaction) => {
                const materialDoc = await transaction.get(rawMaterialRef);
                if (!materialDoc.exists()) {
                    throw new Error("Matéria-prima não encontrada!");
                }

                const currentQuantity = materialDoc.data().quantity || 0;
                const newQuantity = currentQuantity + newPurchase.quantity;
                
                // Update raw material stock
                transaction.update(rawMaterialRef, { 
                    quantity: newQuantity,
                    cost: newPurchase.unitCost // Also update the cost to the latest purchase cost
                });

                // Create new purchase record
                const purchaseToAdd = {
                    ...newPurchase,
                    date: new Date(newPurchase.date).toISOString(),
                    createdAt: serverTimestamp()
                };
                transaction.set(doc(purchasesRef), purchaseToAdd);
            });

            toast({
                title: 'Compra registrada!',
                description: `Estoque da matéria-prima atualizado com sucesso.`,
            });
            
            // Reset form and close dialog
            setNewPurchase({
                rawMaterialId: '',
                quantity: 1,
                unitCost: 0,
                date: new Date().toISOString().split('T')[0]
            });
            setIsNewPurchaseOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Falha na transação',
                description: error.message || "Não foi possível registrar a compra.",
            });
        }
    }

    const getProductDescription = (rawMaterialId: string) => {
        return rawMaterials?.find(p => p.id === rawMaterialId)?.description || 'N/A';
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
         <Dialog open={isNewPurchaseOpen} onOpenChange={setIsNewPurchaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
                <DialogDescription>Adicione uma nova entrada de matéria-prima ao seu estoque.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">Matéria-Prima</Label>
                    <div className="col-span-3 flex gap-2">
                        <Select onValueChange={(value) => setNewPurchase({...newPurchase, rawMaterialId: value})}>
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                            {isLoadingMaterials ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                            rawMaterials?.map(material => (
                                <SelectItem key={material.id} value={material.id}>{material.description}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddPurchase}>Salvar Compra</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Todas as compras de matérias-primas registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matéria-Prima</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPurchases && <TableRow><TableCell colSpan={5} className="h-24 text-center">Carregando compras...</TableCell></TableRow>}
              {!isLoadingPurchases && purchases && purchases.length > 0 ? purchases.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(purchase => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{getProductDescription(purchase.rawMaterialId)}</TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell className="text-right">{purchase.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.unitCost)}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    - {formatCurrency(purchase.quantity * purchase.unitCost)}
                  </TableCell>
                </TableRow>
              )) : (
                !isLoadingPurchases && <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhuma compra registrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
