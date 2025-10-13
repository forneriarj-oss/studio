"use server";

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getAdminApp } from '@/firebase/admin';


// Centralized Current User Getter
export async function getCurrentUser() {
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


export async function handleProduction(productId: string, flavorId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Usuário não autenticado. Faça o login para continuar." };
  }

  const db = getFirestore(getAdminApp());
  const productRef = db.collection('users').doc(user.uid).collection('finished-products').doc(productId);
  const rawMaterialsRef = db.collection('users').doc(user.uid).collection('raw-materials');

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get the finished product to access its recipe
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) {
        throw new Error("Produto acabado não encontrado.");
      }
      const productData = productDoc.data();
      if (!productData || !productData.recipe) {
        throw new Error("Receita não encontrada para este produto.");
      }

      // 2. Check for sufficient raw material stock
      const requiredMaterials = productData.recipe;
      const materialDocsPromises = requiredMaterials.map((item: any) =>
        transaction.get(rawMaterialsRef.doc(item.rawMaterialId))
      );
      const materialDocs = await Promise.all(materialDocsPromises);

      const updates: { ref: FirebaseFirestore.DocumentReference, newQuantity: number }[] = [];

      for (let i = 0; i < materialDocs.length; i++) {
        const materialDoc = materialDocs[i];
        const requiredItem = requiredMaterials[i];

        if (!materialDoc.exists) {
          throw new Error(`Matéria-prima com ID "${requiredItem.rawMaterialId}" não foi encontrada no inventário.`);
        }

        const materialData = materialDoc.data();
        if (!materialData) {
           throw new Error(`Dados não encontrados para a matéria-prima "${requiredItem.rawMaterialId}".`);
        }
        
        const neededQuantity = requiredItem.quantity * quantity;

        if (materialData.quantity < neededQuantity) {
          throw new Error(`Estoque insuficiente para "${materialData.description}". Necessário: ${neededQuantity}, Disponível: ${materialData.quantity}.`);
        }
        
        updates.push({
            ref: materialDoc.ref,
            newQuantity: materialData.quantity - neededQuantity
        });
      }

      // 3. If all checks pass, perform the updates
      updates.forEach(update => {
        transaction.update(update.ref, { quantity: update.newQuantity });
      });

      // 4. Update the stock of the finished product flavor
      const newFlavors = productData.flavors.map((flavor: any) => {
        if (flavor.id === flavorId) {
          return { ...flavor, stock: (flavor.stock || 0) + quantity };
        }
        return flavor;
      });
      transaction.update(productRef, { flavors: newFlavors });
    });

    return { success: true, message: "Produção registrada e estoque atualizado com sucesso!" };

  } catch (error: any) {
    console.error("Erro na transação de produção: ", error);
    return { success: false, message: `Falha na transação: ${error.message}` };
  }
}
