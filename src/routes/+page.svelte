<script lang="ts">
	import { session } from '$lib/stores/session';
	import type { SessionState } from '$lib/types/session.types';

	let loading: boolean = true;
	let loggedIn: boolean = false;

	session.subscribe((current: SessionState) => {
		loading = current?.loading;
		loggedIn = current?.loggedIn;
	});
</script>

<section class="hero">
	<div class="hero-container">
		<div class="page-header">
			<h1>shelf-control</h1>
		</div>

		<p>a web app for managing your book library</p>

		<div class="hero-links">
			{#if !loggedIn}
				<a href="/login" class="button button-secondary">Login</a>
				<a href="/register" class="button button-secondary">Sign up</a>
			{:else}
				<a href="/profile/library" class="button button-secondary">Library</a>
				<a href="/profile" class="button button-secondary">Profile</a>
			{/if}
		</div>
	</div>
</section>

<style>
	section {
		align-items: flex-end;
		justify-content: flex-end;
		height: calc(100vh - 5rem);
		background-color: var(--primary-colour-purple);
		max-width: none;
	}

	h1 {
		color: var(--primary-white);
		padding: 0 1rem 0 1.25rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.25rem;
		font-family: var(--header-font);
		letter-spacing: 0.05rem;
		line-height: 1.75rem;
		margin-bottom: 1rem;
		color: var(--primary-grey);
		padding: 0 0.75rem 0 0.5rem;
		position: relative;
		width: 100%;
	}

	.hero-container {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: flex-end;
		height: 100%;
		margin: 0 1rem 12rem;
		text-align: right;
	}

	.hero-links {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
	}

	@media (min-width: 590px) {
		.hero-container {
			margin: 0 8rem 12rem;
		}

		.page-header {
			margin-bottom: 1rem;
		}
	}

	@media (min-width: 997px) {
		h1 {
			font-size: 5rem;
		}

		p {
			font-size: 1.5rem;
			padding: 0 0.75rem 0 1.25rem;
			line-height: 2.5rem;
			margin-bottom: 2rem;
		}
		.hero-container {
			margin: 0 10rem 10rem;
		}
	}

	@media (min-width: 1440px) {
		.hero-container {
			margin: 0 24rem 12rem;
		}
	}
</style>
