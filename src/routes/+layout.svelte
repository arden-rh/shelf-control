<script lang="ts">
	import { app, auth } from '$lib/firebase/firebase.client';
	import { browser } from '$app/environment';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { session } from '$lib/stores/session';
	import { signOut } from 'firebase/auth';
	import type { AppUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LayoutData } from './$types';
	import { userStore } from '$lib/stores/user';

	export let data: LayoutData;

	let loading: boolean = true;
	let loggedIn: boolean = false;
	let appUser: AppUser | null = null;

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

			userStore.update((current) => {
				return {
					...current,
					...user
				};
			});
			loading = false;
		} catch (error) {
			console.error('Error fetching user:', error);
		}

		if (!loggedIn) {
			goto('/login');
		}
	});

	async function handleLogout() {
		try {
			await signOut(auth);
			session.update(() => ({ user: null, loading: false, loggedIn: false }));
			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

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
</div>

<style>
	@import '../app.pcss';
	@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');
	/* @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300..700&display=swap'); */
	@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;600;700&display=swap');

	:global(body) {
		font-family: var(--body-font);
		background-color: var(--primary-grey);
	}

	nav {
		background-color: var(--primary-color);
		color: var(--primary-grey);
		color: var(--primary-white);
		height: 5rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.layout-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
		width: 100%;
		background-color: var(--primary-color);
	}

	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		background-color: var(--primary-grey);
	}

	@media (min-width: 768px) {
		.nav-container {
			padding: 0 2rem;
		}
	}
</style>
