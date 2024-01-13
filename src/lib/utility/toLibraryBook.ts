import type { LibraryBookWithoutUserId } from "$lib/types/books.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toLibraryBook(source: any): LibraryBookWithoutUserId {
    return {
        title: source.title,
        authors: source.authors,
        publisher: source.publisher,
        publishedDate: source.publishedDate,
        description: source.description,
        pageCount: source.pageCount,
        categories: source.categories,
        imageLinks: source.imageLinks,
        language: source.language,
        canonicalVolumeLink: source.canonicalVolumeLink,
    };
}