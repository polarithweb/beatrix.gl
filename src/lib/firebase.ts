import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

interface AppletFirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const FALLBACK_FIREBASE_CONFIG: AppletFirebaseConfig = {
  projectId: 'grounded-bonfire-ms7sz',
  appId: '1:267525850230:web:7500f7cf9ecf407b1a4b57',
  apiKey: 'AIzaSyBjvbiqbH7FlcuptL2--0dgv8eCcR0XprI',
  authDomain: 'grounded-bonfire-ms7sz.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-b0a8a2d8-9941-4e87-8532-ffb78a040cdf',
  storageBucket: 'grounded-bonfire-ms7sz.firebasestorage.app',
  messagingSenderId: '267525850230',
};

const configModules = import.meta.glob<{ default: AppletFirebaseConfig }>(
  '../../firebase-applet-config.json',
  { eager: true }
);

const loadedConfig =
  configModules['../../firebase-applet-config.json']?.default ||
  FALLBACK_FIREBASE_CONFIG;

const app = initializeApp(loadedConfig);
export const db = getFirestore(
  app,
  loadedConfig.firestoreDatabaseId || 'ai-studio-b0a8a2d8-9941-4e87-8532-ffb78a040cdf'
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const isStaticGitHubPagesHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.github.io');
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore sync fallback (using local persistence):', JSON.stringify(errInfo));
}
