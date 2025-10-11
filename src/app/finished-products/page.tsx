'use client';
import Link from 'next/link';
import { useState } from 'react';
import { getFinishedProducts } from '@/lib/data';
import type { FinishedProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function FinishedProductsPage() {
  const [products, setProducts] = useState<FinishedProduct[]>(getFinishedProducts());

  const totalStockByProduct = (product: FinishedProduct) => {
    return product.flavors.reduce((total, flavor) => total + flavor.stock, 0);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produtos Acabados</h1>
        <Button asChild>
          <Link href="/finished-products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos Acabados</CardTitle>
          <CardDescription>Gerencie seus produtos finais prontos para venda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nome do Produto</TableHead>
                <TableHead className="text-right">Custo Final</TableHead>
                <TableHead className="text-right">Preço de Venda</TableHead>
                <TableHead className="text-center">Estoque Total</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <Accordion type="single" collapsible key={product.id} asChild>
                  <AccordionItem value={product.id} asChild>
                  <>
                    <TableRow>
                      <TableCell className="font-mono">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.finalCost)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(product.salePrice)}</TableCell>
                      <TableCell className="text-center font-bold">{totalStockByProduct(product)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AccordionTrigger className="p-2 hover:bg-muted rounded-md [&[data-state=open]>svg]:rotate-90" />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={6} className="p-0">
                            <AccordionContent>
                                <div className="p-4">
                                  <h4 className="font-semibold mb-2">Estoque por Sabor:</h4>
                                  <div className="grid grid-cols-3 gap-2">
                                  {product.flavors.map(flavor => (
                                    <div key={flavor.id} className="flex justify-between items-center text-sm p-2 bg-background rounded-md">
                                        <span>{flavor.name}</span>
                                        <Badge variant="secondary">{flavor.stock}</Badge>
                                    </div>
                                  ))}
                                  </div>
                                </div>
                            </AccordionContent>
                        </TableCell>
                    </TableRow>
                  </>
                  </AccordionItem>
                </Accordion>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
