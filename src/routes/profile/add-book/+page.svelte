<script lang="ts">
	import { fetchGoogleBooks } from '$lib/queries/books';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { useQuery } from '@sveltestack/svelte-query';
	import { writable } from 'svelte/store';
	import type { Book, BooksResponse } from '$lib/types/books.types';
	import type { PageData } from './$types';

	const query = writable('');
	let localQuery = '';
	// export let q = '';
	const q = writable('');
	export let index = 0;

	export let data: PageData;

	// const booksData = writable(data.props.data);

	const handleSearch = async () => {
		// Perform server-side navigation with the query parameter
		// await goto(`/books/${query}`);
		$query = $query;
	};

	const queryResult = useQuery<BooksResponse>(
		['books', $query],
		async () => {
			console.log('query', $query);
			if ($query) {
				const result = await fetchGoogleBooks($query, index);
				console.log('waiting');
				return result;
			}
			return null;
		},
		{
			enabled: $query !== ''
		}
	);

</script>

<div>
	<h1>Books</h1>
	{#if $queryResult.status === 'loading'}
		<div>Loading...</div>
	{:else if $queryResult.error instanceof Error}
		<div>Error: {$queryResult.error.message}</div>
	{:else if $queryResult.status === 'success'}
		<div>Success!</div>
	{/if}
	<form data-sveltekit-keepfocus action="/profile/add-book" method="get">
		<label>
			Search:
			<input type="text" name="q" bind:value={$q} />
			<button type="submit">Search</button>
		</label>
	</form>
	<span>{$query}</span>
	<hr />
	{#if $queryResult.status === 'success' && $queryResult.data}
		<ul>
			{#each $queryResult.data.items as book}
				<li>
					{book.volumeInfo.title}
				</li>
			{/each}
		</ul>
	{/if}
	{#if data.status === 200}
		{#if data.props.data.items}
			<ul>
				{#each data.props.data.items as book}
					<li>
						{book.volumeInfo.title}
					</li>
				{/each}
			</ul>
		{/if}
	{:else if data.status === 400}
		<div>Not found</div>
	{:else if data.status === 500}
		<div>Server error</div>
	{/if}
</div>
