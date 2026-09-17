import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'quotevid2-57726828-e0133';

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        private_key: privateKey,
      }),
    });
  }

  return initializeApp({ projectId });
}

let _db: Firestore | null = null;
let _auth: Auth | null = null;

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) {
      _db = getFirestore(getAdminApp());
    }
    const val = (_db as any)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  },
});

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) {
      _auth = getAuth(getAdminApp());
    }
    const val = (_auth as any)[prop];
    return typeof val === 'function' ? val.bind(_auth) : val;
  },
});

