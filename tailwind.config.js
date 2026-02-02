/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                olive: '#556B2F',
                navy: '#0A1A2F',
                deep: '#0B0B0B',
                accent: '#9EFFA1',
            },
        },
    },
    plugins: [],
}
