import { doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from '@firebase/util';
import type { UserBook } from '$lib/types/books.types';
import { getBookCollection } from '$lib/firebase.client';
import { writable } from 'svelte/store';

export const errorMsg = writable<string | null>(null);
export const error = writable<boolean>(false);
export const success = writable<boolean>(false);
export const loading = writable<boolean>(false);

export async function createBook(data: UserBook) {
		success.set(false);
		error.set(false);
		errorMsg.set(null);

		try {
			loading.set(true);

			const bookCollection = await getBookCollection();

			if (!bookCollection) {
				throw new Error('Book collection is not initialized');
			}

			const docRef = doc(bookCollection);
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