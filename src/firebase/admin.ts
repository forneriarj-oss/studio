
import * as admin from 'firebase-admin';

// This is the only place where the service account is imported.
// The service account is provided by the Firebase Genkit Development environment.
// It is not checked into version control.
import serviceAccount from '@/firebase/service-account.json';

const BIZVIEW_APP_NAME = 'bizview-admin-app';

// Centralized Firebase Admin App Initialization
export function getAdminApp() {
  // Check if the app is already initialized
  if (admin.apps.some(app => app?.name === BIZVIEW_APP_NAME)) {
    return admin.app(BIZVIEW_APP_NAME);
  }

  // If not initialized, create a new credential and initialize the app
  const credential = admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    // The private key needs to have newlines escaped, so we replace them.
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  });

  return admin.initializeApp({ credential }, BIZVIEW_APP_NAME);
}
