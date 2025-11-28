/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0f172a', // Main background
                    800: '#1e293b', // Card background
                    700: '#334155', // Border/Input
                },
                primary: {
                    500: '#8b5cf6', // Violet/Purple
                    600: '#7c3aed',
                },
                accent: {
                    500: '#10b981', // Emerald/Green for success
                    600: '#059669',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
