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
	import '../app.pcss';
	import { auth } from '$lib/firebase/firebase.client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { session } from '$lib/session';
	import { signOut } from 'firebase/auth';
	import type { SessionState } from '$lib/session';
	import type { User } from '$lib/types/user.types';

	import type { LayoutData } from './$types';
	export let data: LayoutData;

	let loading: boolean = true;
	let loggedIn: boolean = false;

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

		if (loggedIn) {
			goto('/');
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
	<nav>
		{#if loading}
			<div>Loading...</div>
		{:else}
			<div>
				Logged in: {loggedIn}
				<slot name="nav" />
			</div>
		{/if}
		<button on:click={handleLogout}>Logout</button>
	</nav>

	<slot />
</QueryClientProvider>
