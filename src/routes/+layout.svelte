<script context="module" lang="ts">
	export const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<script lang="ts">
	import { auth } from '$lib/firebase/firebase.client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { session } from '$lib/session';
	import { signOut } from 'firebase/auth';
	import type { SessionState } from '$lib/types/session.types';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import type { User } from '$lib/types/user.types';

	import type { LayoutData } from './$types';
	export let data: LayoutData;

	let loading: boolean = true;
	let loggedIn: boolean = false;

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

	onMount(async () => {
		const user: any = await data.getAuthUser();

		const loggedIn = !!user;

		session.update((current: SessionState) => {
			loading = false;
			return {
				...current,
				user,
				loggedIn,
				loading: false
			};
		});

		if (!loggedIn) {
			console.log('Logged in:', user);
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

<QueryClientProvider client={queryClient}>
	<div class="layout-container">
		<nav class="flex flex-row">
			<div class="nav-container flex flex-row justify-between">
				<a href="/" class="logotype">bookshelf</a>
				<div>
					{#if loading}
						<div>Loading...</div>
					{:else}
						<div>
							Logged in: {loggedIn}
							<slot name="nav" />
						</div>
					{/if}
					<button on:click={handleLogout}>Logout</button>
				</div>
			</div>
		</nav>
		<main class="main-container">
			<slot />
		</main>
	</div>
</QueryClientProvider>

<style>
	@import '../app.pcss';
	@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@200..700&display=swap');

	:global(body) {
		font-family: var(--body-font);
		background-color: var(--primary-white);
	}

	nav {
		background-color: var(--primary-color);
		color: var(--primary-white);
		padding: 1rem;
		width: 100%;
	}

	.nav-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin: 0 1rem;
		width: 100%;
		max-width: 1200px;
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
	}

	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 2rem;
		max-width: 1200px;
	}
</style>
