"use server";

import { getFirestore } from 'firebase-admin/firestore';
import { getCurrentUser } from '@/app/finished-products/actions';
import { getAdminApp } from '@/firebase/admin';


// Helper function to delete all documents in a collection
async function deleteCollection(db: FirebaseFirestore.Firestore, collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve(0);
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

export async function deleteAllFinancialData(): Promise<{ success: boolean; message: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("Usuário não autenticado.");
        }

        const db = getFirestore(getAdminApp());

        const collectionsToDelete = [
            `users/${user.uid}/sales`,
            `users/${user.uid}/revenues`,
            `users/${user.uid}/expenses`,
        ];

        for (const collectionPath of collectionsToDelete) {
            await deleteCollection(db, collectionPath, 50);
        }

        return { success: true, message: 'Todos os dados de vendas, receitas e despesas foram zerados com sucesso!' };

    } catch (error: any) {
        console.error("Erro ao zerar dados financeiros:", error);
        return { success: false, message: error.message || "Ocorreu um erro desconhecido." };
    }
}
