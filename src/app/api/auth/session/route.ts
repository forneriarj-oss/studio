import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';
import serviceAccount from '@/firebase/service-account.json';

const BIZVIEW_APP_NAME = 'bizview-admin-app';

function getAdminApp() {
  if (admin.apps.some(app => app?.name === BIZVIEW_APP_NAME)) {
    return admin.app(BIZVIEW_APP_NAME);
  }
  const credential = admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  });
  return admin.initializeApp({ credential }, BIZVIEW_APP_NAME);
}

export async function POST(request: NextRequest) {
  const adminApp = getAdminApp();
  const adminAuth = getAuth(adminApp);

  const idToken = await request.text();
  if (!idToken) {
    return NextResponse.json(
      { error: "ID token is required" },
      { status: 400 }
    );
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  cookies().delete("session");
  return NextResponse.json({ status: "success" });
}
