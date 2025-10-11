'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

/** Handle anonymous sign-in. */
export function handleAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {});
}

/** Handle email/password sign-up. */
export function handleEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(authInstance, email, password).then(() => {});
}

/** Handle email/password sign-in. */
export function handleEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {});
}

/** Handle user sign-out. */
export function handleSignOut(authInstance: Auth): Promise<void> {
    return signOut(authInstance);
}
