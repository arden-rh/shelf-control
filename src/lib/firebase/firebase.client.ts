import { browser } from '$app/environment';
import {
	collection,
	doc,
	getFirestore,
	getDoc,
	getDocs,
	updateDoc,
	writeBatch,
	query,
	where
} from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { LibraryBookWithId } from '$lib/types/books.types';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	useEmulator: import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true'
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

		// if (firebaseConfig.useEmulator) {
		// 	connectAuthEmulator(auth, 'http://127.0.0.1:9099');
		// }
	}
};

/** Get User's Library Collection */
export const getUserLibraryCollection = async (userId: string) => {
	await initializeFirebase();

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDoc = doc(db, 'users', userId);
	return collection(userDoc, 'library');
};

/** Get One Library Book */
export const getUserLibraryBook = async (userId: string, bookId: string) => {
	try {
		const libraryCollectionRef = await getUserLibraryCollection(userId);
		if (!libraryCollectionRef) {
			throw new Error('Unable to get library collection reference');
		}
		const bookDocRef = doc(libraryCollectionRef, bookId);
		const bookSnapshot = await getDoc(bookDocRef);
		if (bookSnapshot.exists()) {
			return bookSnapshot.data() as LibraryBookWithId;
		} else {
			console.log('No such book!');
			return undefined;
		}
	} catch (error) {
		console.error('Error getting book:', error);
		return undefined;
	}
};

/** Get All Library Books */
export const getUserLibraryBooks = async (userId: string) => {
	try {
		const libraryCollectionRef = await getUserLibraryCollection(userId);
		if (!libraryCollectionRef) {
			throw new Error('Unable to get library collection reference');
		}

		const querySnapshot = await getDocs(libraryCollectionRef);
		return querySnapshot.docs.map((doc) => doc.data()) as LibraryBookWithId[];
	} catch (error) {
		console.error('Error fetching user library books:', error);
		throw error;
	}
};

/** Get a User's Bookshelves */
export const getUserBookShelves = async (userId: string) => {
	await initializeFirebase();

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);

    try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            return userData.allBookShelves || [];
        } else {
            console.log('User document not found');
            return [];
        }
    } catch (error) {
        console.error('Error fetching user bookshelves:', error);
        throw error; 
    }
};

export const getBooksByBookshelf = async (userId: string, bookshelf: string) => {
    await initializeFirebase();

    if (!db) {
        console.warn('Firestore is not initialized');
        return undefined;
    }

    try {
        const userLibraryRef = collection(db, 'users', userId, 'library');
        const q = query(userLibraryRef, where('bookShelves', 'array-contains', bookshelf));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            _id: doc.id // Assuming you want to keep the document ID
        }));
    } catch (error) {
        console.error('Error fetching books for user:', error);
        return [];
    }
};

/**
 * Updates a book with new bookshelves information.
 *
 * @param {string} userId - The ID of the user who owns the book.
 * @param {string} bookId - The ID of the book to update.
 * @param {string[]} newBookShelves - An array of bookshelf names to add to the book.
 *
 */
export const addUniqueBookshelvesAndUpdateUser = async (
	userId: string,
	bookId: string,
	newBookShelves: string[]
) => {
	await initializeFirebase();

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);
	const bookDocRef = doc(db, 'users', userId, 'library', bookId);
	const batch = writeBatch(db);

	try {
		const bookDocSnapshot = await getDoc(bookDocRef);
		const currentBookShelves =
			bookDocSnapshot.exists() && bookDocSnapshot.data().bookShelves
				? bookDocSnapshot.data().bookShelves
				: [];

		const userDocSnapshot = await getDoc(userDocRef);
		const currentUserBookShelves =
			userDocSnapshot.exists() && userDocSnapshot.data().allBookShelves
				? userDocSnapshot.data().allBookShelves
				: [];

		const updatedBookShelves = Array.from(new Set([...currentBookShelves, ...newBookShelves]));
		const updatedUserBookShelves = Array.from(
			new Set([...currentUserBookShelves, ...newBookShelves])
		);

		batch.update(bookDocRef, {
			bookShelves: updatedBookShelves
		});

		batch.update(userDocRef, {
			allBookShelves: updatedUserBookShelves
		});

		await batch.commit();
	} catch (error) {
		console.error('Error updating bookshelves:', error);
		throw error;
	}
};
