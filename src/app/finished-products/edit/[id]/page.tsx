'use client';
import { useState, useMemo, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { RawMaterial, RecipeItem, FinishedProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, ArrowLeft, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPriceSuggestion } from '../new/actions';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth, useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function EditFinishedProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id: productId } = params;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const rawMaterialsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/raw-materials`) : null),
    [firestore, user]
  );
  const { data: rawMaterials, isLoading: isLoadingMaterials } = useCollection<RawMaterial>(rawMaterialsRef);

  const productRef = useMemoFirebase(
    () => (user && productId ? doc(firestore, `users/${user.uid}/finished-products/${productId}`) : null),
    [firestore, user, productId]
  );
  const { data: product, isLoading: isLoadingProduct } = useDoc<FinishedProduct>(productRef);
  
  const [isPending, startTransition] = useTransition();
  const [priceSuggestion, setPriceSuggestion] = useState<{ price: number; justification: string } | null>(null);
  
  const [productName, setProductName] = useState('');
  const [categories, setCategories] = useState(['Bolo', 'Pastel', 'Bebida']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [unit, setUnit] = useState('UN');
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [newRecipeItem, setNewRecipeItem] = useState<{ id: string, qty: number | '' }>({ id: '', qty: '' });
  const [manualCost, setManualCost] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');

  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setSelectedCategory(product.category);
      setUnit(product.unit);
      setRecipe(product.recipe);
      setManualCost(product.finalCost);
      setSalePrice(product.salePrice);
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category]);
      }
    }
  }, [product, categories]);


  const calculatedCost = useMemo(() => {
    if (!rawMaterials) return 0;
    return recipe.reduce((total, item) => {
      const material = rawMaterials.find(m => m.id === item.rawMaterialId);
      return total + (material ? material.cost * item.quantity : 0);
    }, 0);
  }, [recipe, rawMaterials]);

  const finalCost = manualCost !== '' ? manualCost : calculatedCost;
  
  const handleAddNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setSelectedCategory(newCategory);
        setNewCategory('');
    }
  }

  const handleAddRecipeItem = () => {
    const materialId = newRecipeItem.id;
    const quantity = Number(newRecipeItem.qty);

    if (materialId && quantity > 0) {
      if (recipe.find(item => item.rawMaterialId === materialId)) {
        toast({
          variant: 'destructive',
          title: 'Item já existe na receita.'
        });
        return;
      }
      setRecipe([...recipe, { rawMaterialId: materialId, quantity: quantity }]);
      setNewRecipeItem({ id: '', qty: '' }); // Reset form
    } else {
        toast({
          variant: 'destructive',
          title: 'Dados inválidos',
          description: 'Selecione uma matéria-prima e insira uma quantidade válida.',
        });
    }
  };

  const handleRemoveRecipeItem = (materialId: string) => {
    setRecipe(recipe.filter(item => item.rawMaterialId !== materialId));
  };


  const getMaterialDescription = (id: string) => {
    if (!rawMaterials) return 'N/A';
    return rawMaterials.find(m => m.id === id)?.description || 'N/A';
  }

  const handleSaveProduct = async () => {
    if (!productName || !salePrice || salePrice <= 0 || finalCost < 0 ) {
       toast({
          variant: 'destructive',
          title: 'Campos obrigatórios incompletos',
          description: 'Preencha a descrição, custo e preço de venda.',
        });
      return;
    }
    if (!productRef) return;
    
    const updatedData = {
      name: productName,
      category: selectedCategory,
      unit,
      recipe,
      finalCost,
      salePrice,
    };

    await updateDoc(productRef, updatedData);

    toast({
      title: 'Produto Atualizado!',
      description: `${productName} foi atualizado com sucesso.`,
    })
    router.push('/finished-products');
  };
  
  const handleSuggestPrice = () => {
    if (!productName || finalCost <= 0) {
      toast({
        variant: 'destructive',
        title: 'Dados insuficientes',
        description: 'É necessário uma descrição para o produto e um custo maior que zero.',
      });
      return;
    }

    const recipeItemsSummary = recipe.map(item => getMaterialDescription(item.rawMaterialId)).join(', ');

    startTransition(async () => {
      setPriceSuggestion(null);
      const result = await getPriceSuggestion({
        productName,
        productCost: finalCost,
        recipeItems: recipeItemsSummary,
      });

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Erro de IA',
          description: result.error,
        });
      } else if (result.suggestion) {
        setSalePrice(result.suggestion.suggestedPrice);
        setPriceSuggestion({
            price: result.suggestion.suggestedPrice,
            justification: result.suggestion.justification,
        });
        toast({
          title: 'Preço Sugerido!',
          description: 'A IA sugeriu um preço de venda para você.',
        });
      }
    });
  };

  if (isLoadingProduct || isLoadingMaterials) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Skeleton className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
          <Card>
              <CardHeader>
                  <CardTitle>Produto não encontrado</CardTitle>
                  <CardDescription>O produto que você está tentando editar não existe ou foi removido.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button asChild><Link href="/finished-products">Voltar para a lista de produtos</Link></Button>
              </CardContent>
          </Card>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/finished-products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
            <p className="text-muted-foreground">Atualize os detalhes do produto. Campos com * são obrigatórios.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="space-y-2">
            <Label htmlFor="product-description">Descrição *</Label>
            <Textarea id="product-description" placeholder="Ex: Bolo de Chocolate" value={productName} onChange={e => setProductName(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Nova Categoria</DialogTitle>
                                <DialogDescription>Adicione uma nova categoria de produto.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="new-category-name">Nome da Categoria</Label>
                                <Input id="new-category-name" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleAddNewCategory}>Adicionar</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Input id="unit" placeholder="Ex: UN, KG, L" value={unit} onChange={e => setUnit(e.target.value.toUpperCase())} />
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Composição do Produto (Incluir Matérias-Primas)</CardTitle>
                <CardDescription>Adicione os insumos para calcular o custo de produção.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="raw-material">Matéria-Prima</Label>
                        <Select value={newRecipeItem.id} onValueChange={(value) => setNewRecipeItem({...newRecipeItem, id: value})}>
                            <SelectTrigger id="raw-material">
                                <SelectValue placeholder="Selecione um insumo" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingMaterials ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                                rawMaterials?.map(material => (
                                    <SelectItem key={material.id} value={material.id} disabled={recipe.some(i => i.rawMaterialId === material.id)}>
                                        {material.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-24 space-y-1">
                        <Label htmlFor="quantity">Qtde.</Label>
                        <Input 
                            id="quantity"
                            type="number" 
                            value={newRecipeItem.qty} 
                            onChange={e => setNewRecipeItem({...newRecipeItem, qty: e.target.value === '' ? '' : Number(e.target.value)})}
                        />
                    </div>
                    <div className="self-end">
                        <Button onClick={handleAddRecipeItem} className="w-full md:w-auto bg-green-600 hover:bg-green-700">Adicionar</Button>
                    </div>
                </div>
                
                {recipe.length > 0 ? (
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
                            {recipe.map(item => {
                                const material = rawMaterials?.find(m => m.id === item.rawMaterialId);
                                return (
                                    <TableRow key={item.rawMaterialId}>
                                        <TableCell className="font-medium">{material?.description}</TableCell>
                                        <TableCell>{item.quantity} {material?.unit}</TableCell>
                                        <TableCell className="text-right">{formatCurrency((material?.cost || 0) * item.quantity)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveRecipeItem(item.rawMaterialId)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">Nenhum insumo na receita.</div>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <div className="space-y-2 p-3 bg-muted rounded-md">
                <Label>Custo Calculado (Receita)</Label>
                <p className="text-2xl font-bold">{formatCurrency(calculatedCost)}</p>
            </div>
            <div className="space-y-2">
                {/* Empty div for layout purposes */}
            </div>
             <div className="space-y-2">
                <Label htmlFor="manual-cost">Custo Manual/Final *</Label>
                <Input id="manual-cost" type="number" placeholder="Substitui o custo calculado" value={manualCost} onChange={e => setManualCost(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="sale-price">Preço de Venda *</Label>
                <div className="flex gap-2">
                    <Input id="sale-price" type="number" placeholder="Ex: 50.00" value={salePrice} onChange={e => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}/>
                     <Button variant="outline" size="icon" onClick={handleSuggestPrice} disabled={isPending}>
                        <Wand2 className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>
        </div>

        {isPending && (
            <div className="space-y-2 pt-2">
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-8 w-full" />
            </div>
        )}
        {priceSuggestion && !isPending && (
            <div className="pt-2">
                <Badge>Sugestão da IA</Badge>
                <p className="text-sm text-muted-foreground mt-2">{priceSuggestion.justification}</p>
            </div>
        )}
        
        <div className="flex justify-end gap-2 pt-8">
            <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button size="lg" onClick={handleSaveProduct}>Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
}
