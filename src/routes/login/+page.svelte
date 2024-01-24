<script lang="ts">
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';
	import { auth } from '$lib/firebase/firebase.client';
	import { getUser } from '$lib/firebase/userFirestore';
	import {
		GoogleAuthProvider,
		signInWithPopup,
		signInWithEmailAndPassword,
		type UserCredential
	} from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

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

				localStorage.setItem('loggedIn', 'true');
				localStorage.setItem('appUser', JSON.stringify(appUser));

				goto('/profile');
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	}

	onMount(async () => {
		const loggedInStatus = localStorage.getItem('loggedIn');
		const appUser = localStorage.getItem('appUser');

		if (loggedInStatus === 'true' && appUser) {
			goto('/profile');
		}
	});
</script>

<section>
	<div class="login-container">
		<div class="login-form">
			<form on:submit={loginWithMail}>
				<div class="input-group">
					<span>
						<label for="email">Email</label>
						<input id="email" bind:value={email} type="text" placeholder="Email" />
					</span>

					<span>
						<label for="password">Password</label>
						<input id="password" bind:value={password} type="password" placeholder="Password" />
					</span>
				</div>
				<button type="submit" class="button button-primary">Login</button>
			</form>
		</div>
		<a class="button button-secondary" href="/register">Don't have an account? Register here</a>
		<div class="page-header">
			<h1>Login Page</h1>
		</div>
	</div>
</section>

<style>
	section {
		flex-direction: column;
		align-items: flex-end;
		justify-content: flex-end;
		height: calc(100vh - 5rem);
		max-width: none;
	}

	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		max-width: 1000px;
		width: 100%;
		height: 100%;
		margin: 0 0 6rem;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 3rem;
	}

	.login-form form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 1rem;
		width: 100%;
	}

	.input-group input {
		border: 2px solid var(--primary-colour-purple);
		border-radius: 5px;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		flex-grow: 1;
	}
	.input-group label {
		align-items: center;
		border-radius: 5px;
		font-family: var(--header-font);
		font-size: 0.9rem;
		display: flex;
		height: 2.75rem;
		letter-spacing: 0.075rem;
		text-transform: uppercase;
		border: 2px solid var(--primary-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--primary-grey);
		min-width: 30%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: 100%;
	}

	.button-secondary {
		width: fit-content;
		margin-top: 2rem;
	}

	.page-header {
		margin: 10rem 2rem 0 0;
		width: fit-content;
	}

	@media (min-width: 768px) {
		section {
			align-items: center;
		}

		.login-form {
			margin-top: 0;
			margin-bottom: 2rem;
		}

		.page-header {
			margin: 6rem 10rem 0 0;
			align-self: flex-end;
		}
	}
</style>
