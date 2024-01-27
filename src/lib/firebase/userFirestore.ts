/** 
 * User Functions 
 * 
 */
import { browser } from "$app/environment";
import { db, initializeFirebase } from "./firebase.client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { AppUser } from "$lib/types/user.types";

/** Get User */
export const getUser = async (userId: string) => {

    if (browser) {
        await initializeFirebase().catch(console.error);
    }

	try {
		if (!db) {
			console.warn('Firestore is not initialized');
			return undefined;
		}

		const userDocRef = doc(db, 'users', userId);
		const userDocSnapshot = await getDoc(userDocRef);

		return userDocSnapshot.exists() ? (userDocSnapshot.data() as AppUser) : undefined;
	} catch (error) {
		console.error('Error getting user:', error);
		return undefined;
	}
};

/** Update User */
export const updateUser = async (userId: string, userData: Partial<AppUser>) => {

    if (browser) {
        await initializeFirebase().catch(console.error);
    }

    try {
		if (!db) {
			console.warn('Firestore is not initialized');
			return undefined;
		}

        const userDocRef = doc(db, 'users', userId);

        await updateDoc(userDocRef, userData);

		return { status: 'success', message: 'User updated'};

    } catch (error) {
        console.error('Error updating user:', error);
		return { status: 'error', message: 'Unable to update user'};
    }
};

/** Get a User's Bookshelves */
export const getUserBookshelves = async (userId: string) => {

    if (browser) {
        await initializeFirebase().catch(console.error);
    }

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);

	try {
		const userDocSnapshot = await getDoc(userDocRef);
		if (userDocSnapshot.exists()) {
			const userData = userDocSnapshot.data();
			return { status: 'success', message: 'User bookshelves fetched', data: userData.allBookshelves as string[] || []}
		} else {
			return { status: 'error', message: 'User document not found', data: undefined };
		}
	} catch (error) {
		return { status: 'error', message: 'Error fetching user bookshelves', data: undefined };
	}
};

/** Delete a User */
export const deleteUserAccount = async (/* userId: string */) => {

	if (browser) {
		await initializeFirebase().catch(console.error);
	}

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	return { status: 'success', message: 'User deleted' };

	/** TODO */

};