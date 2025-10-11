'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRawMaterials } from '@/lib/data';
import type { RawMaterial, RecipeItem, Flavor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function NewFinishedProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const rawMaterials = getRawMaterials();

  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [manualCost, setManualCost] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  
  const [flavors, setFlavors] = useState<Omit<Flavor, 'id'>[]>([]);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorStock, setNewFlavorStock] = useState<number | ''>('');

  const calculatedCost = useMemo(() => {
    return recipe.reduce((total, item) => {
      const material = rawMaterials.find(m => m.id === item.rawMaterialId);
      return total + (material ? material.cost * item.quantity : 0);
    }, 0);
  }, [recipe, rawMaterials]);

  const finalCost = manualCost !== '' ? manualCost : calculatedCost;

  const handleAddRecipeItem = (materialId: string) => {
    if (materialId && !recipe.find(item => item.rawMaterialId === materialId)) {
      setRecipe([...recipe, { rawMaterialId: materialId, quantity: 1 }]);
    }
  };

  const handleUpdateRecipeQuantity = (materialId: string, quantity: number) => {
    setRecipe(recipe.map(item => item.rawMaterialId === materialId ? { ...item, quantity } : item));
  };

  const handleRemoveRecipeItem = (materialId: string) => {
    setRecipe(recipe.filter(item => item.rawMaterialId !== materialId));
  };

  const handleAddFlavor = () => {
    if (newFlavorName && newFlavorStock !== '' && newFlavorStock >= 0) {
      if (flavors.find(f => f.name.toLowerCase() === newFlavorName.toLowerCase())) {
        toast({
          variant: 'destructive',
          title: 'Sabor já existe',
          description: 'Este sabor já foi adicionado à lista.',
        });
        return;
      }
      setFlavors([...flavors, { name: newFlavorName, stock: newFlavorStock }]);
      setNewFlavorName('');
      setNewFlavorStock('');
    } else {
       toast({
          variant: 'destructive',
          title: 'Dados inválidos',
          description: 'Por favor, preencha o nome e o estoque do sabor.',
        });
    }
  };

  const handleRemoveFlavor = (name: string) => {
    setFlavors(flavors.filter(flavor => flavor.name !== name));
  };

  const getMaterialDescription = (id: string) => {
    return rawMaterials.find(m => m.id === id)?.description || 'N/A';
  }

  const handleSaveProduct = () => {
    // Basic Validation
    if (!productName || !salePrice || flavors.length === 0) {
       toast({
          variant: 'destructive',
          title: 'Campos obrigatórios incompletos',
          description: 'Preencha o nome do produto, o preço de venda e adicione pelo menos um sabor.',
        });
      return;
    }
    // In a real app, this would save to a database.
    console.log({
      sku,
      name: productName,
      recipe,
      finalCost,
      salePrice,
      flavors: flavors.map((f, i) => ({...f, id: `flavor-${Date.now()}-${i}`}))
    });
    toast({
      title: 'Produto Salvo!',
      description: `${productName} foi adicionado com sucesso.`,
    })
    router.push('/finished-products');
  };


  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/finished-products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Produto Acabado</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Nome do Produto</Label>
                        <Input id="product-name" placeholder="Ex: Bolo de Chocolate" value={productName} onChange={e => setProductName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">Código (SKU)</Label>
                        <Input id="sku" placeholder="Ex: BOLO-CHOC-01" value={sku} onChange={e => setSku(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Recipe */}
            <Card>
                <CardHeader>
                    <CardTitle>Composição do Produto (Receita)</CardTitle>
                    <CardDescription>Adicione as matérias-primas que compõem este produto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Select onValueChange={handleAddRecipeItem}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma matéria-prima" />
                            </SelectTrigger>
                            <SelectContent>
                                {rawMaterials.map(material => (
                                    <SelectItem key={material.id} value={material.id} disabled={recipe.some(i => i.rawMaterialId === material.id)}>
                                        {material.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Matéria-Prima</TableHead>
                                <TableHead className="w-[120px]">Quantidade</TableHead>
                                <TableHead className="w-[120px] text-right">Custo</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recipe.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Nenhum item na receita.</TableCell>
                                </TableRow>
                            ) : (
                                recipe.map(item => {
                                    const material = rawMaterials.find(m => m.id === item.rawMaterialId);
                                    return (
                                        <TableRow key={item.rawMaterialId}>
                                            <TableCell className="font-medium">{material?.description}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={e => handleUpdateRecipeQuantity(item.rawMaterialId, parseFloat(e.target.value) || 0)}
                                                    className="h-8"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency((material?.cost || 0) * item.quantity)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveRecipeItem(item.rawMaterialId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Flavors and Stock */}
            <Card>
                <CardHeader>
                    <CardTitle>Gestão de Sabores e Estoque</CardTitle>
                    <CardDescription>Adicione variações do produto, como sabores, e gerencie o estoque inicial para cada um.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-2 mb-4">
                        <Input placeholder="Nome do Sabor" value={newFlavorName} onChange={e => setNewFlavorName(e.target.value)} />
                        <Input type="number" placeholder="Estoque Inicial" className="w-[150px]" value={newFlavorStock} onChange={e => setNewFlavorStock(e.target.value === '' ? '' : Number(e.target.value))} />
                        <Button onClick={handleAddFlavor}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar</Button>
                    </div>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sabor</TableHead>
                                <TableHead className="w-[120px]">Estoque</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flavors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Nenhum sabor adicionado.</TableCell>
                                </TableRow>
                            ) : (
                                flavors.map(flavor => (
                                    <TableRow key={flavor.name}>
                                        <TableCell className="font-medium">{flavor.name}</TableCell>
                                        <TableCell>{flavor.stock}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveFlavor(flavor.name)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
        <div className="lg:col-span-1 flex flex-col gap-8 sticky top-24">
            {/* Cost and Price */}
            <Card>
                <CardHeader>
                    <CardTitle>Custo e Preço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 p-3 bg-muted rounded-md">
                        <Label>Custo Calculado (Receita)</Label>
                        <p className="text-2xl font-bold">{formatCurrency(calculatedCost)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="manual-cost">Custo Manual/Final (Opcional)</Label>
                        <Input id="manual-cost" type="number" placeholder="Substitui o custo calculado" value={manualCost} onChange={e => setManualCost(e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sale-price">Preço de Venda</Label>
                        <Input id="sale-price" type="number" placeholder="Ex: 50.00" value={salePrice} onChange={e => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}/>
                    </div>
                </CardContent>
            </Card>
            <Button size="lg" className="w-full" onClick={handleSaveProduct}>Salvar Produto Acabado</Button>
        </div>
      </div>
    </div>
  );
}
