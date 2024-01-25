import { deleteDoc, doc } from 'firebase/firestore';
import { FirebaseError } from '@firebase/util';
import { getUserLibraryCollection } from '$lib/firebase/libraryFirestore';
import { writable } from 'svelte/store';

export const errorMsg = writable<string | null>(null);
export const error = writable<boolean>(false);
export const success = writable<boolean>(false);
export const loading = writable<boolean>(false);

export async function deleteLibraryBook(userId: string, bookId: string) {
	success.set(false);
	error.set(false);
	errorMsg.set(null);

	try {
		loading.set(true);

		const libraryCollection = await getUserLibraryCollection(userId);

		if (!libraryCollection) {
			throw new Error('Book collection is not initialized');
		}

		const docRef = doc(libraryCollection, bookId);

		try {
			await deleteDoc(docRef);
			success.set(true);
			return { status: 'success', message: 'Book deleted successfully' };
		} catch (e) {
			console.log('error', e);
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
