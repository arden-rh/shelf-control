import type { BooksResponse } from '$lib/types/books.types';
import type { PageServerLoad } from './$types';

// export const load: PageServerLoad = async ({ url }) => {

//     const query = url.searchParams.get('q');
//     const index = url.searchParams.get('index');

//     const maxResults = '&maxResults=20';
//     const startIndex = `&startIndex=${index}`;
// 	const res = await fetch(`${import.meta.env.VITE_GOOGLE_BOOKS_API_URL}?q=${query}` + maxResults + startIndex + `&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`);
// 	const data = await res.json();
//     return data;
// }

export const load: PageServerLoad = async (context) => {
	const query = context.url.searchParams.get('q');
	const index = context.url.searchParams.get('index') || 1;

	const maxResults = '&maxResults=20';
	const startIndex = `&startIndex=${index}`;

    if (!query) {
        return
    }

	const res = await fetch(
		`${import.meta.env.VITE_GOOGLE_BOOKS_API_URL}?q=${query}` +
			maxResults +
			startIndex +
			`&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
	);
	const data = await res.json();
	return {
        status: res.status,
		props: {
			data: data as BooksResponse
		}
	};
};
