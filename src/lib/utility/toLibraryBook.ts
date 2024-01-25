import type { LibraryBookWithoutUserId } from "$lib/types/books.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toLibraryBook(source: any): LibraryBookWithoutUserId {
    return {
        authors: source.authors,
        canonicalVolumeLink: source.canonicalVolumeLink,
        categories: source.categories,
        description: source.description,
        imageLinks: source.imageLinks,
        industryIdentifyer: source.industryIdentifiers[0].identifier,
        language: source.language,
        pageCount: source.pageCount,
        printType: source.printType,
        publishedDate: source.publishedDate,
        publisher: source.publisher,
        readingStatus: 'to-read',
        title: source.title
    };
}