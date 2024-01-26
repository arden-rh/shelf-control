import { browser } from '$app/environment';
import { getAuth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore | undefined;

export const initializeFirebase = async () => {
	if (!browser) {
		throw new Error("Can't use the Firebase client on the server.");
	}

	if (!getApps().length) {
		app = initializeApp(firebaseConfig);
		auth = getAuth(app);
		db = getFirestore(app);
	}
};
