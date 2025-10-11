
"use client";

import { useState } from "react";
import type { RawMaterial } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PlusCircle, Edit, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

const EMPTY_PRODUCT_STATE = {
  description: "",
  unit: "",
  cost: 0,
  quantity: 0,
  minStock: 10,
  supplier: 'N/A'
};

export function InventoryClient({ initialProducts }: { initialProducts: RawMaterial[] }) {
  const [products, setProducts] = useState<RawMaterial[]>(initialProducts);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RawMaterial | null>(null);

  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT_STATE);

  const handleAddProduct = () => {
    if (!newProduct.description || !newProduct.unit || newProduct.cost < 0 || newProduct.quantity < 0) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios incompletos",
        description: "Por favor, preencha todos os campos com *.",
      });
      return;
    }

    const productToAdd: RawMaterial = {
      id: `prod-${Date.now()}`,
      code: `CODE-${Date.now()}`,
      ...newProduct
    };
    setProducts(prev => [productToAdd, ...prev].sort((a,b) => a.description.localeCompare(b.description)));
    
    setNewProduct(EMPTY_PRODUCT_STATE);

    toast({
        title: "Matéria-Prima Adicionada!",
        description: `${productToAdd.description} foi adicionado ao seu inventário.`,
    });

    setIsNewProductDialogOpen(false);
  };
  
  const handleOpenEditDialog = (product: RawMaterial) => {
    setSelectedProduct(product);
    setIsEditProductDialogOpen(true);
  }

  const handleEditProduct = () => {
    if (!selectedProduct) return;

     if (!selectedProduct.description || !selectedProduct.unit || selectedProduct.cost < 0 || selectedProduct.quantity < 0) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios incompletos",
        description: "Por favor, preencha todos os campos com *.",
      });
      return;
    }

    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? selectedProduct : p));

    toast({
        title: "Matéria-Prima Atualizada!",
        description: `${selectedProduct.description} foi atualizado com sucesso.`,
    });

    setIsEditProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
        title: "Matéria-Prima Removida!",
        description: `O item foi removido do seu inventário.`,
    });
  }


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
                  <Input id="description" placeholder="Ex: Farinha de Trigo" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="unit">Unidade *</Label>
                        <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({...newProduct, unit: value})}>
                            <SelectTrigger id="unit">
                                <SelectValue placeholder="Selecione"/>
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
                        <Input id="quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})} />
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cost">Custo por Unidade *</Label>
                  <Input id="cost" type="number" placeholder="0" value={newProduct.cost} onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})} />
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
              {products.map(product => (
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
      
      {/* Edit Dialog */}
      {selectedProduct && (
        <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Matéria-Prima</DialogTitle>
                    <DialogDescription>Atualize os detalhes do insumo.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Nome *</Label>
                        <Input id="edit-description" value={selectedProduct.description} onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-unit">Unidade *</Label>
                            <Select value={selectedProduct.unit} onValueChange={(value) => setSelectedProduct({...selectedProduct, unit: value})}>
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
                            <Input id="edit-quantity" type="number" value={selectedProduct.quantity} onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-cost">Custo por Unidade *</Label>
                        <Input id="edit-cost" type="number" value={selectedProduct.cost} onChange={(e) => setSelectedProduct({...selectedProduct, cost: parseFloat(e.target.value) || 0})} />
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

    