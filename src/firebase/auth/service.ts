'use client';
import {
  Auth,
  UserCredential,
  signInAnonymously,
  signOut,
} from 'firebase/auth';

/** Handle anonymous sign-in. */
export function handleAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Handle user sign-out. */
export async function handleSignOut(authInstance: Auth): Promise<void> {
    await signOut(authInstance);
}
