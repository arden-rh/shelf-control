export const fetchGoogleBooks = async (query: string, index = 0) => {
    const maxResults = '&maxResults=20';
    const startIndex = `&startIndex=${index}`;
	const res = await fetch(`${import.meta.env.VITE_GOOGLE_BOOKS_API_URL}?q=${query}` + maxResults + startIndex + `&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`);

    if (!res.ok) {
        // throw new Error('Network response was not ok');
        throw new Error(`${res.status}: ${res.statusText}`);
    }

	const data = await res.json();
    return data;
};
