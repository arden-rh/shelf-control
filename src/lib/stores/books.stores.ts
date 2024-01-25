import { writable } from "svelte/store";
import type { LibraryBookWithId } from "$lib/types/books.types";

export const favouriteBooksStore = writable<LibraryBookWithId[]>([]);
export const allBookStore = writable<LibraryBookWithId[]>([]);

export function removeBookFromAllBooks(bookId: string) {
    allBookStore.update((allBooks) => {
        return allBooks.filter((book) => book._id !== bookId);
    });
}