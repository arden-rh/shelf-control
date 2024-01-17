/** 
 * Library Functions 
 * 
 */

import { collection, doc, getDocs} from "firebase/firestore";
import { db, initializeFirebase } from "./firebase.client";
import type { LibraryBookWithId } from "$lib/types/books.types";

initializeFirebase().catch(console.error);

/** Get User's Library Collection */
export const getUserLibraryCollection = async (userId: string) => {

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);
	return collection(userDocRef, 'library');
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
