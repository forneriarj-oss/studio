
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
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
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setter((prev: any) => ({ ...prev, [field]: event.target.value }));
    };

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
                <Button>Salvar Alterações</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="categories">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Gerenciar Categorias</CardTitle>
                    <CardDescription>Adicione, edite ou remova categorias de produtos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Funcionalidade de gerenciamento de categorias em desenvolvimento.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="advanced">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Configurações Avançadas</CardTitle>
                    <CardDescription>Parâmetros avançados do sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Funcionalidade de configurações avançadas em desenvolvimento.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
