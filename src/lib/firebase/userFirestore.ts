/** 
 * User Functions 
 * 
 */

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, initializeFirebase } from "./firebase.client";
import type { AppUser } from "$lib/types/user.types";

initializeFirebase().catch(console.error);

/** Get User */
export const getUser = async (userId: string) => {
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

	if (!db) {
		console.warn('Firestore is not initialized');
		return undefined;
	}

	const userDocRef = doc(db, 'users', userId);

	try {
		const userDocSnapshot = await getDoc(userDocRef);
		if (userDocSnapshot.exists()) {
			const userData = userDocSnapshot.data();
			return userData.allBookshelves as string[] || [];
		} else {
			console.log('User document not found');
			return [];
		}
	} catch (error) {
		console.error('Error fetching user bookshelves:', error);
		throw error;
	}
};