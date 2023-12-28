<script lang="ts">
	import { useQuery } from '@sveltestack/svelte-query';
	import { fetchGoogleBooks } from '$lib/queries/books';
	import type { Book, BooksResponse } from '$lib/types/books.types';

	export let query: string = '';

	query = 'lord of the rings';

	const queryResult = useQuery<BooksResponse>(['books', query], async () => {
		const result = await fetchGoogleBooks(query);
		return result;
	});

	// const queryResult = useQuery(['books', bookId], async () => await fetchGoogleBookById(bookId));
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
	{#if $queryResult.data}
		<ul>
			{#each $queryResult.data.items as book}
				<li>
					{book.volumeInfo.title}
				</li>
			{/each}
		</ul>
	{/if}
</div>
