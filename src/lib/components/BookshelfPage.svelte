<script lang="ts">
	import type { LibraryBookWithId } from '$lib/types/books.types';

	export let bookshelf: LibraryBookWithId[];
</script>

<h2>Bookshelf</h2>
{#if bookshelf.length > 0}
	<ul>
		{#each bookshelf as book}
			<li>
				<a href={`/profile/library?bookId=${book._id}`}>
					{book.title}
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p>No books added to this bookshelf yet.</p>
{/if}
