'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Settings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const DEFAULT_SETTINGS: Settings = {
    productCategories: ['Bolo', 'Pastel', 'Bebida'],
    taxes: { icms: 0, iss: 0, pis: 0, cofins: 0 },
    paymentRates: { credit: 0, debit: 0, pix: 0, mercadoPago: 0 },
    platformFees: { ifood: 0, taNaMesa: 0 },
    profitMargin: 30
};

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const settingsRef = useMemoFirebase(
      () => (user ? doc(firestore, `users/${user.uid}/settings/app-settings`) : null),
      [firestore, user]
    );
    const { data: settings, isLoading } = useDoc<Settings>(settingsRef);
    
    const [localSettings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [newCategory, setNewCategory] = useState('');
    
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    useEffect(() => {
        if (settings) {
            setLocalSettings(s => ({...s, ...settings}));
        } else if (!isLoading && !settings) {
            setLocalSettings(DEFAULT_SETTINGS);
        }
    }, [settings, isLoading]);

    useEffect(() => {
      if (user) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
      }
    }, [user]);

    const handleInputChange = (section: keyof Settings, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value === '' ? '' : parseFloat(event.target.value);
        setLocalSettings(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };
    
     const handleRootInputChange = (field: keyof Settings) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = async () => {
        if (!settingsRef) return;
        await setDoc(settingsRef, localSettings, { merge: true });
        toast({
            title: 'Configurações Salvas!',
            description: 'Suas alterações foram salvas com sucesso.',
        });
    };

    const handleAddCategory = async () => {
        if (newCategory.trim() === '') {
            toast({ variant: 'destructive', title: 'Erro', description: 'O nome da categoria não pode estar vazio.' });
            return;
        }
        if (localSettings.productCategories?.some(cat => cat.toLowerCase() === newCategory.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Essa categoria já existe.' });
            return;
        }
        
        const updatedCategories = [...(localSettings.productCategories || []), newCategory.trim()];
        setLocalSettings({...localSettings, productCategories: updatedCategories });
        setNewCategory('');

        // Persist immediately
        if (settingsRef) {
          await setDoc(settingsRef, { productCategories: updatedCategories }, { merge: true });
          toast({ title: 'Sucesso', description: `Categoria "${newCategory.trim()}" adicionada.` });
        }
    };

    const handleRemoveCategory = async (categoryToRemove: string) => {
        const updatedCategories = localSettings.productCategories?.filter(cat => cat !== categoryToRemove) || [];
        setLocalSettings({...localSettings, productCategories: updatedCategories });
        
        // Persist immediately
        if (settingsRef) {
          await setDoc(settingsRef, { productCategories: updatedCategories }, { merge: true });
          toast({ title: 'Sucesso', description: `Categoria "${categoryToRemove}" removida.` });
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            return;
        }

        try {
            await updateProfile(user, { displayName, photoURL });
            toast({
                title: 'Perfil Atualizado!',
                description: 'Seu perfil foi atualizado com sucesso. As alterações podem levar um momento para serem refletidas.',
            });
            // The onAuthStateChanged listener in the provider will eventually pick this up
            // For immediate UI update, you might need a local state refresh or force a re-fetch of the user object
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Atualizar',
                description: error.message || 'Ocorreu um erro desconhecido.',
            });
        }
    };
    
    if (isLoading || isUserLoading) {
      return (
         <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground">Ajuste os parâmetros da sua loja e do sistema.</p>
            </div>
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-96 w-full" />
        </div>
      )
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Ajuste os parâmetros da sua loja e do sistema.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="pricing">Precificação</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Perfil de Usuário</CardTitle>
                    <CardDescription>Gerencie suas informações de perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-md">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                                <AvatarFallback>{(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">
                                Para alterar a foto, cole a URL de uma nova imagem no campo abaixo.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ''} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="displayName">Nome de Exibição</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu Nome" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="photoURL">URL da Foto</Label>
                            <Input id="photoURL" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://example.com/sua-foto.jpg" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Salvar Perfil</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <div className="flex flex-col gap-8 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Impostos (%)</CardTitle>
                        <CardDescription>Valores percentuais para impostos sobre o produto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="icms">ICMS</Label>
                            <Input id="icms" type="number" value={localSettings.taxes.icms} onChange={handleInputChange('taxes', 'icms')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iss">ISS</Label>
                            <Input id="iss" type="number" value={localSettings.taxes.iss} onChange={handleInputChange('taxes', 'iss')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pis">PIS</Label>
                            <Input id="pis" type="number" value={localSettings.taxes.pis} onChange={handleInputChange('taxes', 'pis')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cofins">COFINS</Label>
                            <Input id="cofins" type="number" value={localSettings.taxes.cofins} onChange={handleInputChange('taxes', 'cofins')} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Taxas de Pagamento (%)</CardTitle>
                        <CardDescription>Taxas percentuais cobradas pelas operadoras.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="credit">Crédito</Label>
                            <Input id="credit" type="number" value={localSettings.paymentRates.credit} onChange={handleInputChange('paymentRates', 'credit')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="debit">Débito</Label>
                            <Input id="debit" type="number" value={localSettings.paymentRates.debit} onChange={handleInputChange('paymentRates', 'debit')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pix">PIX</Label>
                            <Input id="pix" type="number" value={localSettings.paymentRates.pix} onChange={handleInputChange('paymentRates', 'pix')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mercadoPago">Mercado Pago</Label>
                            <Input id="mercadoPago" type="number" value={localSettings.paymentRates.mercadoPago} onChange={handleInputChange('paymentRates', 'mercadoPago')} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Taxas de Plataformas (%)</CardTitle>
                        <CardDescription>Comissões de serviços de delivery e outros.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ifood">iFood</Label>
                            <Input id="ifood" type="number" value={localSettings.platformFees.ifood} onChange={handleInputChange('platformFees', 'ifood')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taNaMesa">TáNaMesa</Label>
                            <Input id="taNaMesa" type="number" value={localSettings.platformFees.taNaMesa} onChange={handleInputChange('platformFees', 'taNaMesa')} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Margem de Lucro</CardTitle>
                    <CardDescription>A margem de lucro padrão que você deseja aplicar sobre o custo final do produto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-xs space-y-2">
                        <Label htmlFor="profitMargin">Margem de Lucro Padrão (%)</Label>
                        <Input id="profitMargin" type="number" value={localSettings.profitMargin} onChange={handleRootInputChange('profitMargin')} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="categories">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Gerenciar Categorias de Produtos</CardTitle>
                    <CardDescription>Adicione, visualize e remova categorias de produtos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="new-category">Nova Categoria</Label>
                        <div className="flex gap-2 mt-2">
                            <Input 
                                id="new-category" 
                                placeholder="ex: Sobremesas"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button onClick={handleAddCategory}>Adicionar</Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-md font-medium mb-2">Categorias Atuais</h3>
                        <div className="space-y-2 rounded-md border p-4">
                            {localSettings.productCategories && localSettings.productCategories.length > 0 ? localSettings.productCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between">
                                    <span>{cat}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveCategory(cat)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center">Nenhuma categoria cadastrada.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
