'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { 
  handleEmailSignUp, 
  handleEmailSignIn,
  handleAnonymousSignIn,
} from '@/firebase/auth/service';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();

  const handleAuth = async (action: 'login' | 'signup' | 'anonymous') => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de autenticação não disponível.' });
      return;
    }
    
    if ((action === 'login' || action === 'signup') && (!email || !password)) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha o e-mail e a senha.' });
        return;
    }

    setIsSubmitting(true);
    
    try {
      let userCredential;
      if (action === 'login') {
        userCredential = await handleEmailSignIn(auth, email, password);
      } else if (action === 'signup') {
        userCredential = await handleEmailSignUp(auth, email, password);
      } else {
        userCredential = await handleAnonymousSignIn(auth);
      }
      
      const idToken = await userCredential.user.getIdToken();
      
      // Create server-side session
      await fetch('/api/auth/session', {
          method: 'POST',
          body: idToken,
      });

      toast({ title: 'Sucesso!', description: 'Login realizado com sucesso.' });
      router.replace('/');

    } catch (error: any) {
        const errorCode = error.code || 'unknown';
        let errorMessage = 'Ocorreu um erro desconhecido.';
        
        switch (errorCode) {
            case 'auth/invalid-email':
                errorMessage = 'O formato do e-mail é inválido.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                 errorMessage = 'E-mail ou senha incorretos.';
                 break;
            case 'auth/email-already-in-use':
                errorMessage = 'Este e-mail já está em uso por outra conta.';
                break;
             case 'auth/weak-password':
                errorMessage = 'A senha é muito fraca. Tente uma mais forte.';
                break;
            default:
                errorMessage = error.message;
                break;
        }

        toast({
            variant: 'destructive',
            title: 'Erro de Autenticação',
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Acesse sua conta para gerenciar seu negócio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-login">Senha</Label>
                <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button className="w-full" onClick={() => handleAuth('login')} disabled={isSubmitting}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleAuth('anonymous')} disabled={isSubmitting}>
                  Entrar como Visitante
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar</CardTitle>
              <CardDescription>Crie uma nova conta para começar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-signup">Senha</Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleAuth('signup')} disabled={isSubmitting}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar Conta
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
