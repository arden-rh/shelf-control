/**
 * Library Functions
 *
 */

import { browser } from '$app/environment';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db, initializeFirebase } from './firebase.client';
import type { LibraryBookWithId } from '$lib/types/books.types';

/** Get User's Library Collection */
export const getUserLibraryCollection = async (userId: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);
	return collection(userDocRef, 'library');
};

/** Get All Library Books */
export const getUserLibraryBooks = async (userId: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

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

/** Update Library Bookshelves */
export const updateUserLibraryBookshelves = async (userId: string, bookshelves: string[]) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	try {
		const userDocRef = doc(db, 'users', userId);
		await updateDoc(userDocRef, { allBookshelves: bookshelves });
		return { status: 'success', message: 'Bookshelves updated successfully' };
	} catch (error) {
		console.error('Error updating user bookshelves:', error);
		throw error;
	}
};

/** Delete Library */
export const deleteUserLibrary = async (userId: string) => {
	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	try {
		const libraryCollectionRef = await getUserLibraryCollection(userId);
		if (!libraryCollectionRef) {
			throw new Error('Unable to get library collection reference');
		}

		const snapshot = await getDocs(libraryCollectionRef);

		const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
		await Promise.all(deletePromises);

		return { status: 'success', message: 'Library deleted successfully' };
	} catch (error) {
		console.error('Error deleting user library:', error);
		throw error;
	}
};
