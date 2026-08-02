import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Cloud sync is OPTIONAL. If these public env vars are not set, firebaseReady is
// false and the whole app runs local-only (the archive still works in the
// browser). Firebase web config is not secret; security is enforced by Firestore
// rules, not by hiding these values.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(
  config.apiKey && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;

function fbApp(): FirebaseApp | null {
  if (!firebaseReady || typeof window === "undefined") return null;
  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp(config as Record<string, string>);
  }
  return app;
}

export function fbAuth(): Auth | null {
  const a = fbApp();
  return a ? getAuth(a) : null;
}

export function fbDb(): Firestore | null {
  const a = fbApp();
  return a ? getFirestore(a) : null;
}
