import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseError } from '@firebase/util';
import { getUserLibraryCollection } from '$lib/firebase/libraryFirestore';
import { writable } from 'svelte/store';
import type { LibraryBookWithId } from '$lib/types/books.types';

export const errorMsg = writable<string | null>(null);
export const error = writable<boolean>(false);
export const success = writable<boolean>(false);
export const loading = writable<boolean>(false);

export async function editLibraryBook(userId: string, data: LibraryBookWithId) {
	success.set(false);
	error.set(false);
	errorMsg.set(null);

	try {
		loading.set(true);

		const libraryCollection = await getUserLibraryCollection(userId);

		if (!libraryCollection) {
			throw new Error('Book collection is not initialized');
		}

		const docRef = doc(libraryCollection, data._id);

		try {
			await updateDoc(docRef, { ...data });
			success.set(true);
			return { status: 'success', message: 'Book updated successfully' };
		} catch (e) {
			error.set(true);

			if (e instanceof FirebaseError) {
				errorMsg.set(e.message);
			} else if (e instanceof Error) {
				errorMsg.set(e.message);
			} else {
				errorMsg.set('Something went wrong, please try again');
			}

			return { status: 'error', message: errorMsg };
		}
	} catch (e) {
		error.set(true);

		if (e instanceof FirebaseError) {
			errorMsg.set(e.message);
		} else if (e instanceof Error) {
			errorMsg.set(e.message);
		} else {
			errorMsg.set('Something went wrong, please try again');
		}

		return { status: 'error', message: errorMsg };
	} finally {
		loading.set(false);
	}
}
