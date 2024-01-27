import type { BooksResponse } from '$lib/types/books.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (context) => {
	const query = context.url.searchParams.get('q');
	const author = context.url.searchParams.get('author');
	const index = 1;

	const maxResults = '&maxResults=20';
	const startIndex = `&startIndex=${index}`;

	if (!query) {
		return;
	}

	try {

		if (author) {
			console.log('author', author)
			const res = await fetch(
				`${import.meta.env.VITE_GOOGLE_BOOKS_API_URL}?q=${query}+inauthor:${author}` +
					maxResults +
					startIndex +
					`&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
			);

			if (!res.ok) {
				throw new Error(`HTTP error: ${res.status}`);
			}

			const data = await res.json();
			return {
				status: res.status,
				props: {
					data: data as BooksResponse
				}
			};
		}

		const res = await fetch(
			`${import.meta.env.VITE_GOOGLE_BOOKS_API_URL}?q=${query}` +
				maxResults +
				startIndex +
				`&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
		);

		if (!res.ok) {
			throw new Error(`HTTP error: ${res.status}`);
		}

		const data = await res.json();
		return {
			status: res.status,
			props: {
				data: data as BooksResponse
			}
		};
	} catch (err) {
		return { status: 500, error: 'Server Error' }
	}
};
