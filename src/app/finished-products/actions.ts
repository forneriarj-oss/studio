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
  const rawMaterialsCol = db.collection('users').doc(user.uid).collection('raw-materials');

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get the finished product to access its recipe
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) {
        throw new Error("Produto acabado não encontrado.");
      }
      const productData = productDoc.data();
      if (!productData || !productData.recipe || productData.recipe.length === 0) {
        // If there's no recipe, we just update the stock and finish.
        const newFlavors = productData.flavors.map((flavor: any) => {
            if (flavor.id === flavorId) {
                return { ...flavor, stock: (flavor.stock || 0) + quantity };
            }
            return flavor;
        });
        transaction.update(productRef, { flavors: newFlavors });
        return;
      }

      // 2. Check for sufficient raw material stock
      const requiredMaterials = productData.recipe;
      
      const materialIds = requiredMaterials.map((item: any) => item.rawMaterialId);
      const materialDocsSnap = await transaction.getAll(
        ...materialIds.map((id: string) => rawMaterialsCol.doc(id))
      );

      const materialUpdates: { ref: FirebaseFirestore.DocumentReference, newQuantity: number }[] = [];
      const missingMaterials: string[] = [];
      const insufficientStock: string[] = [];

      materialDocsSnap.forEach((materialDoc, index) => {
        const requiredItem = requiredMaterials[index];
        
        if (!materialDoc.exists) {
          missingMaterials.push(requiredItem.rawMaterialId);
          return;
        }

        const materialData = materialDoc.data();
        if (!materialData) {
           missingMaterials.push(requiredItem.rawMaterialId);
           return;
        }

        const neededQuantity = requiredItem.quantity * quantity;

        if (materialData.quantity < neededQuantity) {
          insufficientStock.push(`'${materialData.description}' (Necessário: ${neededQuantity}, Disponível: ${materialData.quantity})`);
        }
        
        materialUpdates.push({
            ref: materialDoc.ref,
            newQuantity: materialData.quantity - neededQuantity
        });
      });

      if (missingMaterials.length > 0) {
        throw new Error(`Matérias-primas não encontradas no inventário: ${missingMaterials.join(', ')}.`);
      }
      if (insufficientStock.length > 0) {
        throw new Error(`Estoque insuficiente para: ${insufficientStock.join(', ')}.`);
      }


      // 3. If all checks pass, perform the updates
      materialUpdates.forEach(update => {
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
