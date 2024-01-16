<script lang="ts">
	import type { LibraryBookWithId } from "$lib/types/books.types";

    export let book: LibraryBookWithId;

    // You can use 'book' to access the book's properties
</script>

<article>
    <h1>{book.title}</h1>
    <!-- Add more book details here -->
    <p>{book.description}</p>
    <!-- ... -->
</article>