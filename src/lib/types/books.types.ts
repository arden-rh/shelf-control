export interface Book {
	id: string;
    etag: string;
    selfLink: string;
	volumeInfo: VolumeInfo;
    // accessInfo: {
    //     country: string;
    //     viewability: string;
    //     embeddable: boolean;
    //     publicDomain: boolean;
    //     textToSpeechPermission: string;
    //     epub: {
    //         isAvailable: boolean;
    //         acsTokenLink: string;
    //     };
    //     pdf: {
    //         isAvailable: boolean;
    //         acsTokenLink: string;
    //     };
    //     webReaderLink: string;
    // };
    searchInfo: {
        textSnippet: string;
    };
}

export interface BooksResponse {
    totalItems: number,
	items: Book[];
}

type VolumeInfo = {
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
    // averageRating: number;
    // ratingsCount: number;
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