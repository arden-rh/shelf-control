import { doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from '@firebase/util';
import { getUserLibraryCollection } from '$lib/firebase/firebase.client';
import { writable } from 'svelte/store';
import type { LibraryBook } from '$lib/types/books.types';

export const errorMsg = writable<string | null>(null);
export const error = writable<boolean>(false);
export const success = writable<boolean>(false);
export const loading = writable<boolean>(false);

export async function createBook(userId: string, data: LibraryBook) {
		success.set(false);
		error.set(false);
		errorMsg.set(null);

		try {
			loading.set(true);

			const libraryCollection = await getUserLibraryCollection(userId);

			if (!libraryCollection) {
				throw new Error('Book collection is not initialized');
			}

			const docRef = doc(libraryCollection);
			await setDoc(docRef, { ...data, _id: docRef.id });

			success.set(true);
		} catch (e) {
			error.set(true);

			if (e instanceof FirebaseError) {
				errorMsg.set(e.message);
			} else if (e instanceof Error) {
				errorMsg.set(e.message);
			} else {
				errorMsg.set('Something went wrong, please try again');
			}
		}

		loading.set(false);
	}