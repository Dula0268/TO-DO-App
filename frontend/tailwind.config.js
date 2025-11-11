/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enables dark mode toggle via class
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
        text: {
          light: '#000000',
          dark: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};
