<script lang="ts">
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';
	import { auth, getUser } from '$lib/firebase/firebase.client';
	import {
		GoogleAuthProvider,
		signInWithPopup,
		signInWithEmailAndPassword,
		type UserCredential
	} from 'firebase/auth';
	import { goto } from '$app/navigation';

	let email: string = '';
	let password: string = '';

	async function loginWithMail() {
		try {
			const result = await signInWithEmailAndPassword(auth, email, password);
			const { user }: UserCredential = result;

			if (!user) {
				return;
			}

			try {
				const appUser = await getUser(user.uid);

				if (!appUser) {
					return;
				}

				session.set({
					loading: false,
					loggedIn: true,
					user: appUser
				});

				userStore.set(appUser);

				goto('/profile');
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="login-form">
	<h1>Login</h1>
	<form on:submit={loginWithMail}>
		<input bind:value={email} type="text" placeholder="Email" />
		<input bind:value={password} type="password" placeholder="Password" />
		<button type="submit">Login</button>
	</form>

	<!-- <div>or</div>

	<button on:click={loginWithGoogle}>Login with Google</button> -->
	<div>Don't you have an account? <a href="/register"> Register</a></div>
</div>
