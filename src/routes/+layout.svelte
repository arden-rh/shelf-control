<script lang="ts">
	import { app, auth } from '$lib/firebase/firebase.client';
	import { browser } from '$app/environment';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { session } from '$lib/stores/session.stores';
	import { signOut } from 'firebase/auth';
	import { userStore } from '$lib/stores/user.stores';
	import Toaster from '$lib/components/Toaster.svelte';
	import type { AppUser } from '$lib/types/user.types';
	import type { LayoutData } from './$types';
	import type { SessionState } from '$lib/types/session.types';

	export let data: LayoutData;

	let loading: boolean = true;
	let loggedIn: boolean = false;
	let appUser: AppUser | null = null;
	const privateInfoDefault: AppUser['privateInfo'] = {
		bookshelves: 'users',
		favourites: 'users',
		profilePicture: 'users'
	};

	const {
		elements: { trigger, menu, item, separator, arrow },
		builders: { createSubmenu, createMenuRadioGroup, createCheckboxItem },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		loop: true
	});

	session.subscribe((current: SessionState) => {
		loading = current?.loading;
		loggedIn = current?.loggedIn;
	});

	userStore.subscribe((current: AppUser) => {
		if (current) {
			appUser = current;
		}
	});

	onMount(async () => {
		const user: any = await data.getAuthUser();
		const storedAppUser = localStorage.getItem('appUser');
		const loggedIn = !!user;

		try {
			session.update((current: SessionState) => {
				return {
					...current,
					user,
					loggedIn,
					loading: false
				};
			});

			if (storedAppUser) {
				userStore.set(JSON.parse(storedAppUser));
			} else {
				console.log('No stored user found');
			}

			loading = false;
		} catch (error) {
			console.error('Error fetching user:', error);
		}

		if (!loggedIn && !storedAppUser) {
			goto('/register');
		} else if (!loggedIn && storedAppUser) {
			goto('/login');
		}
	});

	async function handleLogout() {
		try {
			await signOut(auth);
			session.update(() => ({ user: null, loading: false, loggedIn: false }));
			userStore.set({ privateInfo: privateInfoDefault });
			localStorage.removeItem('loggedIn');
			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<Toaster />

<div class="layout-container">
	<nav class="flex flex-row">
		<div class="nav-container flex flex-row justify-between">
			<a href="/" class="logotype">shelf-control</a>
			<div class="nav-menu">
				{#if loading}
					<div class="button button-secondary">Loading...</div>
				{:else if loggedIn}
					<a class="button button-secondary" href="/profile">Profile</a>
					<button class="button button-secondary" on:click={handleLogout}>Logout</button>
				{:else}
					<a class="button button-secondary" href="/login">Login</a>
				{/if}
			</div>
		</div>
	</nav>
	<main class="main-container">
		<slot />
	</main>
	<footer class="footer-container">
		<div class="footer-content">
			<u class="footer-links">
				<li><a href="/">Home</a></li>
				<li><a href="/profile">Profile</a></li>
				<li><a href="/profile/library">Library</a></li>
			</u>
		</div>
	</footer>
</div>

<style>
	@import '../app.pcss';
	@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;600;700&display=swap');

	:global(body) {
		font-family: var(--body-font);
		background-color: var(--accent-light-blue-grey);
	}

	nav {
		background-color: var(--primary-colour-purple);
		color: var(--primary-grey);
		color: var(--primary-white);
		height: 5rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 5px 0px 5px 0px rgba(0, 0, 0, 0.6);
		z-index: 1;
	}

	footer {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 5rem;
	}

	.footer-container {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.footer-content {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		max-width: 800px;
	}

	.footer-links {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		list-style: none;
		font-family: var(--header-font);
		text-transform: uppercase;
		text-decoration: none;
	}

	.footer-links li a {
		font-size: 0.75rem;
	}

	.footer-links li a:hover {
		color: var(--accent-pink-purple);
	}

	.nav-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		width: 100%;
		max-width: 1200px;
	}

	.nav-menu {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
	}

	.logotype {
		font-family: var(--header-font);
		font-size: 1.75rem;
		font-weight: 600;
		letter-spacing: 0.05rem;
	}

	.logotype:hover {
		color: var(--accent-pink-purple);
	}

	.layout-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
		width: 100%;
		background-color: var(--primary-colour-purple);
	}

	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		background-color: var(--accent-light-blue-grey);
		min-height: calc(100vh - 10rem);
	}

	@media (min-width: 768px) {
		.footer-links li a {
			font-size: 0.9rem;
		}
		.nav-container {
			padding: 0 2rem;
		}
	}
</style>
