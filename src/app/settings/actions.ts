
"use server";

import { getAuth } from 'firebase-admin/auth';
import { getCurrentUser } from '../finished-products/actions';
import { getAdminApp } from '@/firebase/admin';

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
