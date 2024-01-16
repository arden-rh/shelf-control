<script lang="ts">
	import { session } from '$lib/session';
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
		<h1>shelf-control</h1>

		<p>a web app for managing your book library</p>

		{#if !loggedIn}
			<div class="hero-links">
				<a href="/login" class="button button-secondary">Login</a>
				<a href="/register" class="button button-secondary">Sign up</a>
			</div>
		{:else}
			<a href="/profile" class="button button-secondary">Profile</a>
		{/if}
	</div>
</section>

<style>
	section {
		align-items: end;
		justify-content: end;
		height: calc(100vh - 5rem);
		background-color: var(--primary-color);
		max-width: none;
	}

	h1 {
		font-size: 3rem;
		font-family: var(--header-font);
		font-weight: 600;
		letter-spacing: 0.05rem;
		margin-bottom: 0.75rem;
		color: var(--primary-white);
		padding: 0 1rem 0 1.25rem;
		border-right: 0.25rem solid var(--secondary-color);
		border-bottom: 0.25rem solid var(--secondary-color);
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

	@media (min-width: 768px) {
		h1 {
			font-size: 5rem;
			border-right: 0.5rem solid var(--secondary-color);
			border-bottom: 0.5rem solid var(--secondary-color);
		}

		p {
			font-size: 1.5rem;
			margin-bottom: 0.75rem;
			padding: 0 0.75rem 0 1.25rem;
			line-height: 2.5rem;
			margin-bottom: 2rem;
		}
		.hero-container {
			margin: 0 10rem 16rem;
		}
	}
</style>
