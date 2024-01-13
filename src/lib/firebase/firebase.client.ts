import { browser } from '$app/environment';
import { collection, doc, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	useEmulator: import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'false'
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

		if (firebaseConfig.useEmulator) {
			connectAuthEmulator(auth, 'http://127.0.0.1:9099');
		}
	}
};

export const getUserLibraryCollection = async (userId: string) => {
	await initializeFirebase();

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDoc = doc(db, 'users', userId);
	return collection(userDoc, 'library');
}
