module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// "Gallery" Scale: Warm, crisp grays leaning towards brown/stone
				gallery: {
					50: '#F9F7F5', // Main Background (Airy)
					100: '#F2EFEC', // Hover states
					200: '#E6E0DB', // Borders / Dividers
					300: '#D6D0CA', // Deep Borders
					400: '#A8A29D', // Icons / Disabled text
					500: '#857F7A', // Muted Text (Subtitles)
					600: '#635E59', // Body Text (Secondary)
					700: '#45413D', // Body Text (Primary)
					800: '#2E2B29', // Headings
					900: '#1C1917' // "Black" / Strongest contrast
				},
				// Serious Accent: Signal Orange
				// Use sparingly (e.g. text-accent-500 for links, bg-accent-500 for tiny badges)
				accent: {
					50: '#FFF5EB',
					100: '#FFE8D6',
					200: '#FFD1AD',
					300: '#FFB785',
					400: '#FF9652',
					500: '#FF7411', // MAIN BRAND ACCENT
					600: '#E65C00',
					700: '#CC4600',
					800: '#993300',
					900: '#662200'
				}
			},
			fonts: {
				PPMori: ['"PP Mori"', 'sans-serif'],
				sans: ['serif', '"PP Mori"', 'sans-serif'],
				W95FA: ['"W95FA"', 'sans-serif']
			}
		}
	},
	plugins: []
};
