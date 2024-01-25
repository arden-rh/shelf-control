export interface LibraryBook {
    authors?: string[];
    bookshelves?: string[];
    canonicalVolumeLink?: string;
    categories?: string[];
    description?: string;
    language?: string;
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
    industryIdentifyer?: string;
    pageCount?: number;
    printType?: string;
    publishedDate?: string;
    publisher?: string;
    readingStatus: 'to-read' | 'reading' | 'read';
    title: string;    
    userId: string;
}

export interface LibraryBookWithId extends LibraryBook { _id: string; }

export interface LibraryBookWithoutUserId extends Omit<LibraryBook, 'userId'> {}

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