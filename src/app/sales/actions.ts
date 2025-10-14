"use server";

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getAdminApp } from '@/firebase/admin';
import type { Sale } from '@/lib/types';


// Centralized Current User Getter
async function getCurrentUser() {
    const adminApp = await getAdminApp();
    const adminAuth = getAuth(adminApp);
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying session cookie:', error);
        return null;
    }
}
