<script lang="ts">
	import { auth, db } from '$lib/firebase/firebase.client';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let email: string = '';
	let password: string = '';
	let displayName: string = '';

	async function handleRegister() {
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password);
			const { user } = result;

			const constructedDisplayName = displayName.replace(/\s/g, '.').trim() + '-' + user?.uid.slice(0, 5);

			if (db) {
				const userDocRef = doc(db, 'users', user.uid);
				await setDoc(userDocRef, {
					uid: user.uid,
					email: user.email,
					displayName: constructedDisplayName,
					privateInfo: {
						bookshelves: 'users',
						favourites: 'users',
						profilePicture: 'users'
					}
				});
			}

			session.set({
				loading: false,
				loggedIn: true,
				user: {
					displayName: constructedDisplayName,
					email: user?.email,
					uid: user?.uid
				}
			});

			userStore.set({
				displayName: constructedDisplayName,
				email: user?.email,
				uid: user?.uid,
				privateInfo: {
					bookshelves: 'users',
					favourites: 'users',
					profilePicture: 'users'
				}
			});

			localStorage.setItem('loggedIn', 'true');
			localStorage.setItem('appUser', JSON.stringify($userStore));

			goto('/profile');
		} catch (error) {
			console.log('error', error);
		}
	}

	onMount(async () => {
		const storedAppUser = localStorage.getItem('appUser');
		const loggedIn = localStorage.getItem('loggedIn');

		if (storedAppUser && loggedIn) {
			goto('/profile');
		}

		// if (!loggedIn) {
		// 	goto('/login');
		// }
	});
</script>

<section>
	<div class="register-container">
		<div class="register-form">
			<form on:submit={handleRegister}>
				<div class="input-group">
					<span>
						<label for="email">Email*</label>
						<input id="email" bind:value={email} type="text" placeholder="Email" aria-describedby="asteriskExplanation" />
					</span>

					<span>
						<label for="displayName">Display Name</label>
						<input
							id="displayName"
							bind:value={displayName}
							type="text"
							placeholder="Display Name"
						/>
					</span>

					<span>
						<label for="password">Password*</label>
						<input id="password" bind:value={password} type="password" placeholder="Password" aria-describedby="asteriskExplanation" />
					</span>
				</div>

				<small id="asteriskExplanation">* Required field</small>

				<button class="button button-primary" type="submit">Register</button>
			</form>
		</div>
		<div class="page-header">
			<h1>Register</h1>
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

	small {
		font-size: 0.75rem;
		color: var(--primary-black);
		margin-bottom: 1rem;
		width: 100%;
		text-align: end;
		font-family: var(--header-font);
		text-transform: uppercase;
		letter-spacing: 0.05rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
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
		border: 2px solid var(--accent-light-blue-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--accent-light-blue-grey);
		min-width: 35%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: 100%;
		max-width: 100%;
	}

	.register-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		max-width: 1000px;
		width: 100%;
		height: 100%;
		margin: 0 0 6rem;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 3rem 0 0;
		padding: 0 1rem;
		width: 100%;
		max-width: 500px;
	}

	.register-form form {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.page-header {
		margin: 10rem 2rem 0 0;
		width: fit-content;
	}

	@media (max-width: 400px) {
		.input-group label {
			min-width: 25%;
		}
	}

	@media (min-width: 768px) {
		section {
			align-items: center;
		}

		.input-group label {
			min-width: 25%;

		}

		.register-form {
			margin-top: 0;
			margin-bottom: 2rem;
		}

		.page-header {
			margin: 6rem 10rem 0 0;
			align-self: flex-end;
		}
	}
</style>
