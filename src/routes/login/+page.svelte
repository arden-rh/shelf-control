<script lang="ts">
	import { session } from '$lib/stores/session.stores';
	import { userStore } from '$lib/stores/user.stores';
	import { auth } from '$lib/firebase/firebase.client';
	import { getUser } from '$lib/firebase/userFirestore';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { UserCredential } from 'firebase/auth';

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
				<div class="button-group">
					<button type="submit" class="button button-primary">Login</button>
					<button type="button" class="button button-secondary" on:click={() => goto('/register')}
						>Register</button
					>
				</div>
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
		margin: 6rem 0;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 3rem 0;
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
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		flex-grow: 1;
		font-size: 0.9rem;
		width: calc(100% - 30% - 5rem);
	}
	.input-group label {
		align-items: center;
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
		justify-content: center;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: 100%;
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
