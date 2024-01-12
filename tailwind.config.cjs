const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			"midnight": '#161A30',
			'indigo': '#31304D',
			'storm': '#B6BBC4',
			'desert': '#F0ECE5',
			'red': '#BC4B51',
      'magnolia': '#f3eff5',
      'rose': '#785964',
      'slate': '#0f172a'
		},
		fontFamily: {
      'sans': ['Mona\\ Sans', 'sans-serif'],
      'serif': ['serif'],
      'mono': ['ui-monospace', 'monospace'],
    },
		screens: {
			'xs': '475px',
			...defaultTheme.screens,
		},
    extend: {
      height: {
				"10v": "10vh",
				"20v": "20vh",
				"30v": "30vh",
				"40v": "40vh",
				"50v": "50vh",
				"60v": "60vh",
				"70v": "70vh",
				"80v": "80vh",
				"90v": "90vh",
				"100v": "100vh",
			},
    }
	},
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
};
