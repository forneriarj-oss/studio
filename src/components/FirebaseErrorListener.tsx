'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It shows a toast with a developer-friendly error message.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firebase Permission Error:', error.request);
      toast({
        variant: 'destructive',
        title: 'Erro de Permissão do Firestore',
        description: (
          <div className="text-xs font-mono bg-background text-foreground p-2 rounded-md overflow-x-auto">
            <p>A operação <strong>{error.request.method}</strong> na rota <strong>{error.request.path.replace('/databases/(default)/documents/', '')}</strong> falhou.</p>
            <p className="mt-2">Verifique as regras de segurança do seu Firestore.</p>
          </div>
        ),
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
