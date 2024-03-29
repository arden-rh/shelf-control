/**
 * Book Functions
 *
 */
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc,
	where,
	writeBatch
} from 'firebase/firestore';
import { browser } from '$app/environment';
import { db, initializeFirebase } from './firebase.client';
import { getUserLibraryCollection } from './libraryFirestore';
import type { LibraryBookWithId } from '$lib/types/books.types';

/** Get One Library Book */
export const getUserLibraryBook = async (userId: string, bookId: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	try {
		const libraryCollectionRef = await getUserLibraryCollection(userId);
		if (!libraryCollectionRef) {
			throw new Error('Unable to get library collection reference');
		}
		const bookDocRef = doc(libraryCollectionRef, bookId);
		const bookSnapshot = await getDoc(bookDocRef);
		if (bookSnapshot.exists()) {
			return { status: 'success', message: 'Got library book', data: bookSnapshot.data() as LibraryBookWithId};
		} else {
			return { status: 'error', message: 'Found no matching book', data: undefined };
		}
	} catch (error) {
		return { status: 'error', message: 'Error getting book', data: undefined };
	}
};

/** Get all Books with the same 'bookshelf' tag */
export const getBooksByBookshelf = async (userId: string, bookshelf: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	try {
		const userLibraryRef = collection(db, 'users', userId, 'library');
		const q = query(userLibraryRef, where('bookshelves', 'array-contains', bookshelf));
		const querySnapshot = await getDocs(q);

		return { status: 'success', message: 'Succesfully got books', data: querySnapshot.docs.map((doc) => doc.data()) as LibraryBookWithId[] };
	} catch (error) {
		console.error('Error fetching books for user:', error);
		return { status: 'error', message: 'Error fetching books for user', data: [] };
	}
};

export const getBooksByReadingStatus = async (userId: string, readingStatus: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	try {
		const userLibraryRef = collection(db, 'users', userId, 'library');
		const q = query(userLibraryRef, where('readingStatus', '==', readingStatus));
		const querySnapshot = await getDocs(q);

		return { status: 'success', message: 'Reading status updated successfully', data: querySnapshot.docs.map((doc) => doc.data()) as LibraryBookWithId[] };
	} catch (error) {
		console.error('Error fetching books for user:', error);
		return { status: 'error', message: 'Error fetching books for user', data: [] };
	}
};

export const updateLibraryBookReadingStatus = async (
	userId: string,
	bookId: string,
	readingStatus: string
) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	try {
		const userLibraryRef = collection(db, 'users', userId, 'library');
		const bookDocRef = doc(userLibraryRef, bookId);

		await updateDoc(bookDocRef, {
			readingStatus: readingStatus
		});

		return { status: 'success', message: 'Reading status successfully' };
	} catch (error) {
		return { status: 'error', message: 'Error updating reading status' };
	}
};

export const updateLibraryBookBookshelves = async ( userId: string, bookId: string, bookshelves: string[]) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	try {
		const userLibraryRef = collection(db, 'users', userId, 'library');
		const bookDocRef = doc(userLibraryRef, bookId);

		await updateDoc(bookDocRef, {
			bookshelves: bookshelves
		});

		return { status: 'success', message: 'Bookshelves updated successfully' };
	} catch (error) {
		return { status: 'error', message: 'Error updating bookshelves' };
	}
}


/**
 * Updates a book and a user with new bookshelves information.
 *
 * @param {string} userId - The ID of the user who owns the book.
 * @param {string} bookId - The ID of the book to update.
 * @param {string[]} newBookshelves - An array of bookshelf names to add to the book.
 *
 */
export const addUniqueBookshelvesAndUpdateUser = async (
	userId: string,
	bookId: string,
	newBookshelves: string[]
) => {
	if (newBookshelves[0] === '') {
		return;
	}

	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);
	const bookDocRef = doc(db, 'users', userId, 'library', bookId);
	const batch = writeBatch(db);

	try {
		const bookDocSnapshot = await getDoc(bookDocRef);
		const currentBookshelves =
			bookDocSnapshot.exists() && bookDocSnapshot.data().bookshelves
				? bookDocSnapshot.data().bookshelves
				: [];

		const userDocSnapshot = await getDoc(userDocRef);
		const currentUserBookshelves =
			userDocSnapshot.exists() && userDocSnapshot.data().allBookshelves
				? userDocSnapshot.data().allBookshelves
				: [];

		const updatedBookshelves = Array.from(new Set([...currentBookshelves, ...newBookshelves]));
		const updatedUserBookshelves = Array.from(
			new Set([...currentUserBookshelves, ...newBookshelves])
		);

		batch.update(bookDocRef, {
			bookshelves: updatedBookshelves
		});

		batch.update(userDocRef, {
			allBookshelves: updatedUserBookshelves
		});

		await batch.commit();
		return { status: 'success', message: 'Bookshelves updated successfully' };
	} catch (error) {
		return { status: 'error', message: 'Error updating bookshelves' };
	}
};
