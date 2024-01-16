<script lang="ts">
	import { auth, db } from '$lib/firebase/firebase.client';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';

	let email: string = '';
	let password: string = '';
	let displayName: string = '';

	async function handleRegister() {
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password);
			const { user } = result;

			if (db) {
				const userDocRef = doc(db, 'users', user.uid);
				await setDoc(userDocRef, {
					uid: user.uid,
					email: user.email,
					displayName: displayName
				});
			}

			userStore.set({
				displayName: user?.displayName,
				email: user?.email,
				uid: user?.uid
			});

			session.set({
				loading: false,
				loggedIn: true,
				user: {
					displayName: user?.displayName,
					email: user?.email,
					uid: user?.uid
				}
			});

			goto('/profile');
		} catch (error) {
			console.log('error', error);
		}
	}
</script>

<div class="register-form">
	<form on:submit={handleRegister}>
		<h2>Register</h2>
		<input bind:value={email} type="text" placeholder="Email" />
		<input bind:value={displayName} type="text" placeholder="Display Name" />
		<input bind:value={password} type="password" placeholder="Password" />
		<button type="submit">Register</button>
	</form>
</div>
