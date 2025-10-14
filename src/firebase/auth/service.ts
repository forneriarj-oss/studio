'use client';
import {
  Auth,
  UserCredential,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

/** Handle anonymous sign-in. */
export function handleAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Handle email/password sign-up. */
export function handleEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Handle email/password sign-in. */
export function handleEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Handle user sign-out. */
export async function handleSignOut(authInstance: Auth): Promise<void> {
    await signOut(authInstance);
    // Also clear the server-side session cookie
    await fetch('/api/auth/session', { method: 'DELETE' });
}
