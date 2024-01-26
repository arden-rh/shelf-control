import type { LibraryBookWithoutUserId } from "$lib/types/books.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toLibraryBook(source: any, manualBook?: boolean): LibraryBookWithoutUserId {

    if (manualBook) {
        return {
            authors: source.authors || ['Unknown'],
            canonicalVolumeLink: source.canonicalVolumeLink || 'Not available',
            categories: source.categories || ['No assigned categories'],
            description: source.description || 'No description available',
            imageLinks: source.imageLinks || { smallThumbnail: '', thumbnail: '' },
            industryIdentifyer: source.identifierIdentifier || 'Not available',
            language: source.language || 'Not available',
            pageCount: source.pageCount || 0,
            printType: source.printType || 'Not available',
            publishedDate: source.publishedDate || 'Not available',
            publisher: source.publisher || 'Not available',
            readingStatus: 'to-read',
            title: source.title || 'Not available'
        };
    }

    return {
        authors: source.authors || ['Unknown'],
        canonicalVolumeLink: source.canonicalVolumeLink || 'Not available',
        categories: source.categories || ['No assigned categories'],
        description: source.description || 'No description available',
        imageLinks: source.imageLinks || { smallThumbnail: '', thumbnail: '' },
        industryIdentifyer: source.industryIdentifiers[0].identifier || 'Not available',
        language: source.language || 'Not available',
        pageCount: source.pageCount || 0,
        printType: source.printType || 'Not available',
        publishedDate: source.publishedDate || 'Not available',
        publisher: source.publisher || 'Not available',
        readingStatus: 'to-read',
        title: source.title || 'Not available'
    };
}