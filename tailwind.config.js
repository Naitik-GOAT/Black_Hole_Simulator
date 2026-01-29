/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                space: {
                    black: '#050505',
                    dark: '#0a0a12',
                    accent: '#00d0ff'
                }
            },
            fontFamily: {
                mono: ['"Share Tech Mono"', 'monospace'], // Suggest a tech font
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
