'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Since we are using mock data, we don't need to initialize Firebase.
  // We'll just render the FirebaseProvider which now handles the "offline" state.
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
