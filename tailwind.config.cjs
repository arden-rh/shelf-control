/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		colors: {
			transparent: 'transparent',
			black: '#000',
			white: '#fff',
			gray: {
				100: '#f7fafc',
				// ...
				900: '#1a202c'
			}

			// ...
		},
		extend: {
			// fontFamily: {
			// 	display: 'Oswald, ui-serif' // Adds a new `font-display` class
			// }
		},
		fontFamily: {
			// sans: ['Oswald', 'sans-serif'],
		},
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		}
	},

	plugins: []
};

module.exports = config;
