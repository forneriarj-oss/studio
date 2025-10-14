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


export async function cancelSale(sale: Sale): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Usuário não autenticado." };
    }
    if (!sale.id) {
        return { success: false, message: "ID da venda inválido." };
    }
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(user.uid);
    
    const saleRef = userRef.collection('sales').doc(sale.id);
    const productRef = userRef.collection('finished-products').doc(sale.productId);
    
    // O ID da receita é derivado do ID da venda para garantir a atomicidade
    const revenueId = sale.revenueId || `rev_${sale.id}`;
    const revenueRef = userRef.collection('revenues').doc(revenueId);

    try {
        await db.runTransaction(async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Produto associado à venda não encontrado.");
            }
            const productData = productDoc.data();
            if (!productData) {
                 throw new Error("Dados do produto não encontrados.");
            }

            // 1. Restaurar o estoque do sabor
            const newFlavors = productData.flavors.map((flavor: any) => {
                if (flavor.id === sale.flavorId) {
                    return { ...flavor, stock: flavor.stock + sale.quantity };
                }
                return flavor;
            });
            transaction.update(productRef, { flavors: newFlavors });

            // 2. Excluir o registro de venda
            transaction.delete(saleRef);

            // 3. Excluir o registro de receita associado
            transaction.delete(revenueRef);
        });

        return { success: true, message: "Venda cancelada e estoque restaurado com sucesso!" };

    } catch (error: any) {
        console.error("Erro na transação de cancelamento de venda: ", error);
        return { success: false, message: `Falha ao cancelar venda: ${error.message}` };
    }
}
