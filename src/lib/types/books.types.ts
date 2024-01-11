export interface UserBook {
    title: string;
    authors: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
    language?: string;
    canonicalVolumeLink?: string;
    userId: string;
}

export interface UserBookWithId extends UserBook { _id: string; }

export interface UserBookWithoutUserId extends Omit<UserBook, 'userId'> {}

export interface Book {
	id: string;
    etag: string;
    selfLink: string;
	volumeInfo: VolumeInfo;
    searchInfo: {
        textSnippet: string;
    };
}

export interface BooksResponse {
    totalItems: number,
	items: Book[];
}

export interface VolumeInfo {
    title: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    description: string;
    industryIdentifiers: {
        type: string;
        identifier: string;
    }[];
    readingModes: {
        text: boolean;
        image: boolean;
    };
    pageCount: number;
    printType: string;
    categories: string[];
    averageRating: number;
    ratingsCount: number;
    maturityRating: string;
    panelizationSummary: {
        containsEpubBubbles: boolean;
        containsImageBubbles: boolean;
    };
    imageLinks: {
        smallThumbnail: string;
        thumbnail: string;
    };
    language: string;
    canonicalVolumeLink: string;
}