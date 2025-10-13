'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { handleAnonymousSignIn } from '@/firebase/auth/service';
import { Loader } from 'lucide-react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


async function ensureUserProfile(firestore: any, user: User) {
  if (!user) return;
  const userDocRef = doc(firestore, `users/${user.uid}`);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      displayName: user.displayName || 'Novo Usuário',
      photoURL: user.photoURL || '',
    });
  }
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSignIn = async () => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(firestore, userCredential.user);
      toast({ title: 'Login bem-sucedido!' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: error.message || 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUp = async () => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(firestore, userCredential.user);
      toast({ title: 'Conta criada com sucesso!', description: 'Você será redirecionado em breve.' });
       router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Conta',
        description: error.message || 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onAnonymousSignIn = async () => {
    setIsSubmitting(true);
    try {
        await handleAnonymousSignIn(auth);
        toast({ title: 'Login anônimo bem-sucedido!' });
        router.push('/');
    } catch (error: any)
    {
        toast({
            variant: 'destructive',
            title: 'Erro de Login Anônimo',
            description: error.message || 'Ocorreu um erro desconhecido.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }

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
              <Button className="w-full" onClick={onSignIn} disabled={isSubmitting}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
              <Button variant="outline" className="w-full" onClick={onAnonymousSignIn} disabled={isSubmitting}>
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
              <Button className="w-full" onClick={onSignUp} disabled={isSubmitting}>
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
