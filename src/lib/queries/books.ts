export const fetchGoogleBooks = async (query: string) => {
	const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
	const data = await res.json();
    return data;
};
