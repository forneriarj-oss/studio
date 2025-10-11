"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
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
} from "@/components/ui/dialog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

export function InventoryClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState({
    code: "",
    description: "",
    unit: "",
    cost: 0,
    supplier: "",
    quantity: 0,
    minStock: 10,
  });

  const handleAddProduct = () => {
    const productToAdd: Product = {
      id: `prod-${Date.now()}`,
      ...newProduct
    };
    setProducts([...products, productToAdd]);
    // Reset form
    setNewProduct({
      code: "",
      description: "",
      unit: "",
      cost: 0,
      supplier: "",
      quantity: 0,
      minStock: 10,
    });
  };


  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Gerencie seus produtos e níveis de estoque.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">Código</Label>
                  <Input id="code" value={newProduct.code} onChange={(e) => setNewProduct({...newProduct, code: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descrição</Label>
                  <Input id="description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unidade</Label>
                  <Input id="unit" value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">Custo</Label>
                  <Input id="cost" type="number" value={newProduct.cost} onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                  <Input id="quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minStock" className="text-right">Estoque Mín.</Label>
                  <Input id="minStock" type="number" value={newProduct.minStock} onChange={(e) => setNewProduct({...newProduct, minStock: parseInt(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Fornecedor</Label>
                  <Input id="supplier" value={newProduct.supplier} onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleAddProduct}>Salvar Produto</Button>
                </DialogClose>
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
