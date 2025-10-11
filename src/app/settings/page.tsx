
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSales, getExpenses, getRevenue, getFinishedProducts, resetAllData } from '@/lib/data';
import { Trash2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [taxes, setTaxes] = useState({
        icms: '0',
        iss: '0',
        pis: '0',
        cofins: '0'
    });

    const [paymentRates, setPaymentRates] = useState({
        credit: '0',
        debit: '0',
        pix: '0',
        mercadoPago: '0'
    });

    const [platformFees, setPlatformFees] = useState({
        ifood: '0',
        taNaMesa: '0'
    });

    const [profitMargin, setProfitMargin] = useState('30');
    
    const [categories, setCategories] = useState(['Bolo', 'Pastel', 'Bebida']);
    const [newCategory, setNewCategory] = useState('');

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setter((prev: any) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSaveChanges = () => {
        toast({
            title: 'Configurações Salvas!',
            description: 'Suas alterações foram salvas com sucesso.',
        });
    };

    const handleAddCategory = () => {
        if (newCategory.trim() === '') {
            toast({ variant: 'destructive', title: 'Erro', description: 'O nome da categoria não pode estar vazio.' });
            return;
        }
        if (categories.some(cat => cat.toLowerCase() === newCategory.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Essa categoria já existe.' });
            return;
        }
        setCategories(prev => [...prev, newCategory.trim()]);
        setNewCategory('');
        toast({ title: 'Sucesso', description: `Categoria "${newCategory.trim()}" adicionada.` });
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
        setCategories(prev => prev.filter(cat => cat !== categoryToRemove));
        toast({ title: 'Sucesso', description: `Categoria "${categoryToRemove}" removida.` });
    };

    const handleExportPDF = (type: 'sales' | 'expenses' | 'revenue') => {
        const doc = new jsPDF();
        
        let title = '';
        let head: string[][] = [];
        let body: any[][] = [];

        const products = getFinishedProducts();
        const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

        switch (type) {
            case 'sales':
                title = 'Relatório de Vendas';
                head = [['Data', 'Produto', 'Sabor', 'Qtd', 'Preço Unit.', 'Total']];
                const sales = getSales();
                body = sales.map(sale => {
                    const product = products.find(p => p.id === sale.productId);
                    const flavor = product?.flavors.find(f => f.id === sale.flavorId);
                    return [
                        new Date(sale.date).toLocaleDateString('pt-BR'),
                        product?.name || 'N/A',
                        flavor?.name || 'N/A',
                        sale.quantity,
                        formatCurrency(sale.unitPrice),
                        formatCurrency(sale.quantity * sale.unitPrice)
                    ];
                });
                break;
            case 'expenses':
                title = 'Relatório de Despesas';
                head = [['Data', 'Descrição', 'Categoria', 'Valor']];
                const expenses = getExpenses();
                body = expenses.map(exp => [
                    new Date(exp.date).toLocaleDateString('pt-BR'),
                    exp.description,
                    exp.category,
                    formatCurrency(exp.amount)
                ]);
                break;
            case 'revenue':
                title = 'Relatório de Receitas';
                head = [['Data', 'Fonte', 'Valor']];
                const revenues = getRevenue();
                body = revenues.map(rev => [
                    new Date(rev.date).toLocaleDateString('pt-BR'),
                    rev.source,
                    formatCurrency(rev.amount)
                ]);
                break;
        }

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        autoTable(doc, {
            startY: 30,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: 'Exportação Concluída', description: `O relatório foi salvo em PDF.` });
    };

    const handleResetData = () => {
        toast({
            title: 'Você tem certeza?',
            description: 'Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os dados de vendas, despesas e receitas.',
            action: <Button variant="destructive" onClick={() => {
                resetAllData();
                toast({
                    title: 'Dados Zerados!',
                    description: 'Todas as vendas, despesas e receitas foram removidas.',
                });
                router.push('/settings');
            }}>Sim, zerar dados</Button>,
        });
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Ajuste os parâmetros da sua loja e do sistema.</p>
      </div>

      <Tabs defaultValue="pricing">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="pricing">Precificação</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>
        
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
                            <Input id="icms" value={taxes.icms} onChange={handleInputChange(setTaxes, 'icms')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iss">ISS</Label>
                            <Input id="iss" value={taxes.iss} onChange={handleInputChange(setTaxes, 'iss')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pis">PIS</Label>
                            <Input id="pis" value={taxes.pis} onChange={handleInputChange(setTaxes, 'pis')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cofins">COFINS</Label>
                            <Input id="cofins" value={taxes.cofins} onChange={handleInputChange(setTaxes, 'cofins')} />
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
                            <Input id="credit" value={paymentRates.credit} onChange={handleInputChange(setPaymentRates, 'credit')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="debit">Débito</Label>
                            <Input id="debit" value={paymentRates.debit} onChange={handleInputChange(setPaymentRates, 'debit')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pix">PIX</Label>
                            <Input id="pix" value={paymentRates.pix} onChange={handleInputChange(setPaymentRates, 'pix')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mercadoPago">Mercado Pago</Label>
                            <Input id="mercadoPago" value={paymentRates.mercadoPago} onChange={handleInputChange(setPaymentRates, 'mercadoPago')} />
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
                            <Input id="ifood" value={platformFees.ifood} onChange={handleInputChange(setPlatformFees, 'ifood')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taNaMesa">TáNaMesa</Label>
                            <Input id="taNaMesa" value={platformFees.taNaMesa} onChange={handleInputChange(setPlatformFees, 'taNaMesa')} />
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
                        <Input id="profitMargin" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} />
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
                    <CardTitle>Gerenciar Categorias</CardTitle>
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
                            {categories.length > 0 ? categories.map(cat => (
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
        <TabsContent value="advanced">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Configurações Avançadas</CardTitle>
                    <CardDescription>Exporte seus dados do sistema ou execute ações perigosas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Exportar Dados</h3>
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <div>
                                <h4 className="font-medium">Exportar Dados de Vendas</h4>
                                <p className="text-sm text-muted-foreground">Baixe um arquivo PDF com todas as vendas registradas.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleExportPDF('sales')}>Exportar PDF</Button>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <div>
                                <h4 className="font-medium">Exportar Dados de Despesas</h4>
                                <p className="text-sm text-muted-foreground">Baixe um arquivo PDF com todas as despesas registradas.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleExportPDF('expenses')}>Exportar PDF</Button>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-4">
                            <div>
                                <h4 className="font-medium">Exportar Dados de Receitas</h4>
                                <p className="text-sm text-muted-foreground">Baixe um arquivo PDF com todas as receitas registradas.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleExportPDF('revenue')}>Exportar PDF</Button>
                        </div>
                    </div>
                    <div className="rounded-lg border border-destructive/50 p-4">
                        <div className="flex items-center gap-2">
                           <AlertCircle className="h-5 w-5 text-destructive" />
                           <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">A ação abaixo é permanente e não pode ser desfeita. Tenha certeza absoluta antes de continuar.</p>
                        <Button variant="destructive" className="mt-4" onClick={handleResetData}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Zerar Dados de Vendas e Caixa
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
