'use client';

import { useState, useMemo } from 'react';
import type { RawMaterial } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const EMPTY_PRODUCT_STATE = {
  description: '',
  unit: '',
  cost: 0,
  quantity: 0,
  minStock: 10,
  supplier: 'N/A',
  code: `CODE-${Date.now()}`,
};

const MOCK_RAW_MATERIALS: RawMaterial[] = [
    { id: 'raw1', code: 'RM001', description: 'Farinha de Trigo', unit: 'KG', cost: 5, supplier: 'Fornecedor A', quantity: 8, minStock: 10 },
    { id: 'raw2', code: 'RM002', description: 'Ovos', unit: 'UN', cost: 0.5, supplier: 'Fornecedor B', quantity: 20, minStock: 24 },
    { id: 'raw3', code: 'RM003', description: 'Chocolate em Barra', unit: 'KG', cost: 30, supplier: 'Fornecedor A', quantity: 15, minStock: 5 },
];


export function InventoryClient() {
  const [products, setProducts] = useState<RawMaterial[]>(MOCK_RAW_MATERIALS);
  const isLoading = false;

  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [editProductForm, setEditProductForm] = useState<RawMaterial | null>(null);

  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT_STATE);

  const handleAddProduct = async () => {
    if (!newProduct.description || !newProduct.unit || newProduct.cost < 0 || newProduct.quantity < 0) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios incompletos',
        description: 'Por favor, preencha todos os campos com *.',
      });
      return;
    }
    
    const productToAdd: RawMaterial = { ...newProduct, id: `raw-${Date.now()}` };
    setProducts(prev => [productToAdd, ...prev]);

    toast({
      title: 'Matéria-Prima Adicionada!',
      description: `${newProduct.description} foi adicionado ao seu inventário.`,
    });

    setIsNewProductDialogOpen(false);
  };

  const handleOpenEditDialog = (product: RawMaterial) => {
    setEditProductForm(product);
    setIsEditProductDialogOpen(true);
  };

  const handleEditProduct = async () => {
    if (!editProductForm) return;

    if (!editProductForm.description || !editProductForm.unit || editProductForm.cost < 0 || editProductForm.quantity < 0) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios incompletos',
        description: 'Por favor, preencha todos os campos com *.',
      });
      return;
    }

    setProducts(prev => prev.map(p => p.id === editProductForm.id ? editProductForm : p));

    toast({
      title: 'Matéria-Prima Atualizada!',
      description: `${editProductForm.description} foi atualizado com sucesso.`,
    });

    setIsEditProductDialogOpen(false);
    setEditProductForm(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: 'Matéria-Prima Removida!',
      description: `O item foi removido do seu inventário.`,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Matérias-Primas</CardTitle>
            <CardDescription>Gerencie suas matérias-primas e níveis de estoque.</CardDescription>
          </div>
          <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setNewProduct(EMPTY_PRODUCT_STATE)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Matéria-Prima
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Matéria-Prima</DialogTitle>
                <DialogDescription>Preencha os detalhes do insumo. Campos com * são obrigatórios.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Nome *</Label>
                  <Input id="description" placeholder="Ex: Farinha de Trigo" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade *</Label>
                    <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}>
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                        <SelectItem value="KG">Quilograma (KG)</SelectItem>
                        <SelectItem value="G">Grama (G)</SelectItem>
                        <SelectItem value="L">Litro (L)</SelectItem>
                        <SelectItem value="ML">Mililitro (ML)</SelectItem>
                        <SelectItem value="PORCAO70G">Porção (70g)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Estoque Atual *</Label>
                    <Input id="quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo por Unidade *</Label>
                  <Input id="cost" type="number" placeholder="0" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddProduct}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Carregando matérias-primas...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && products?.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.description}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.cost)}</TableCell>
                  <TableCell className="text-right font-semibold">{product.quantity}</TableCell>
                  <TableCell>
                    {product.quantity <= product.minStock ? (
                      <Badge variant="destructive" className="flex items-center w-fit">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(product)}>
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
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a matéria-prima.
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editProductForm && (
        <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Matéria-Prima</DialogTitle>
              <DialogDescription>Atualize os detalhes do insumo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Nome *</Label>
                <Input id="edit-description" value={editProductForm.description} onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unidade *</Label>
                  <Select value={editProductForm.unit} onValueChange={(value) => setEditProductForm(editProductForm ? { ...editProductForm, unit: value } : null)}>
                    <SelectTrigger id="edit-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">Unidade (UN)</SelectItem>
                      <SelectItem value="KG">Quilograma (KG)</SelectItem>
                      <SelectItem value="G">Grama (G)</SelectItem>
                      <SelectItem value="L">Litro (L)</SelectItem>
                      <SelectItem value="ML">Mililitro (ML)</SelectItem>
                      <SelectItem value="PORCAO70G">Porção (70g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Estoque Atual *</Label>
                  <Input id="edit-quantity" type="number" value={editProductForm.quantity} onChange={(e) => setEditProductForm(editProductForm ? { ...editProductForm, quantity: parseInt(e.target.value) || 0 } : null)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Custo por Unidade *</Label>
                <Input id="edit-cost" type="number" value={editProductForm.cost} onChange={(e) => setEditProductForm(editProductForm ? { ...editProductForm, cost: parseFloat(e.target.value) || 0 } : null)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-min-stock">Estoque Mínimo</Label>
                <Input id="edit-min-stock" type="number" value={editProductForm.minStock} onChange={(e) => setEditProductForm(editProductForm ? { ...editProductForm, minStock: parseInt(e.target.value) || 0 } : null)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Fornecedor</Label>
                <Input id="edit-supplier" value={editProductForm.supplier} onChange={(e) => setEditProductForm({ ...editProductForm, supplier: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" onClick={handleEditProduct}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
