'use server';
import * as admin from 'firebase-admin';
import serviceAccount from '@/firebase/service-account.json';

const BIZVIEW_ADMIN_APP_NAME = 'bizview-admin-app';

export async function getAdminApp() {
  if (admin.apps.some(app => app?.name === BIZVIEW_ADMIN_APP_NAME)) {
    return admin.app(BIZVIEW_ADMIN_APP_NAME);
  }
  
  // Garante a substituição de '\n' (string) pelo caractere de quebra de linha real
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

  const credential = admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: privateKey,
  });

  return admin.initializeApp({ credential }, BIZVIEW_ADMIN_APP_NAME);
}
