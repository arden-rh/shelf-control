/** @type {import('./$types').LayoutLoad} */

import { browser } from '$app/environment';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, auth } from '$lib/firebase.client';

export async function load({ url }) {
	if (browser) {
		try {
			initializeFirebase();
		} catch (ex) {
			console.error(ex);
		}
	}

	async function getAuthUser() {
		return new Promise((resolve) => {
			onAuthStateChanged(auth, (user) => {
				resolve(user ? user : false);
			});
		});
	}

	return {
		getAuthUser: getAuthUser,
		url: url.pathname
	};
}
