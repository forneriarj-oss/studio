
"use server";

import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import serviceAccount from '@/firebase/service-account.json';

const BIZVIEW_APP_NAME = 'bizview-app-settings';

// Initialize Firebase Admin SDK if not already initialized
function getAdminApp() {
  if (admin.apps.some(app => app?.name === BIZVIEW_APP_NAME)) {
    return admin.app(BIZVIEW_APP_NAME);
  }

  // Cast serviceAccount to the correct type
  const credential = admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  return admin.initializeApp({ credential }, BIZVIEW_APP_NAME);
}


async function getCurrentUser() {
    const adminAuth = getAuth(getAdminApp());
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

interface UpdateProfilePayload {
    displayName: string;
    photoURL: string;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const adminAuth = getAuth(getAdminApp());
    
    try {
        await adminAuth.updateUser(user.uid, {
            displayName: payload.displayName,
            photoURL: payload.photoURL,
        });

        return { success: true, message: "Perfil atualizado com sucesso!" };
    } catch (error: any) {
        console.error("Erro ao atualizar o perfil do usuário:", error);
        return { success: false, message: error.message || "Ocorreu um erro desconhecido ao atualizar o perfil." };
    }
}
