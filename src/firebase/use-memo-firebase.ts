'use client';
import { useMemo, DependencyList } from "react";
/**
 * Custom hook to memoize Firestore queries and references.
 * Ensures that a new query/reference object is only created when its dependencies change,
 * preventing unnecessary re-renders and infinite loops in `useCollection` or `useDoc`.
 *
 * @template T The type of the value to be memoized (e.g., Query, DocumentReference).
 * @param {() => T | null | undefined} factory A function that creates the Firestore query/reference.
 * @param {DependencyList} deps An array of dependencies for the useMemo hook.
 * @returns {T | null | undefined} The memoized Firestore query/reference.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}