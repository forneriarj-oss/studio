
"use client";

import { useState } from "react";
import type { RawMaterial } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PlusCircle } from "lucide-react";
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

export function InventoryClient({ initialProducts }: { initialProducts: RawMaterial[] }) {
  const [products, setProducts] = useState<RawMaterial[]>(initialProducts);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState({
    description: "",
    unit: "",
    cost: 0,
    quantity: 0,
    minStock: 10,
    supplier: 'N/A'
  });

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
    
    setNewProduct({
      description: "",
      unit: "",
      cost: 0,
      quantity: 0,
      minStock: 10,
      supplier: 'N/A'
    });

    toast({
        title: "Matéria-Prima Adicionada!",
        description: `${productToAdd.description} foi adicionado ao seu inventário.`,
    });

    setIsNewProductDialogOpen(false);
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
              <Button>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
