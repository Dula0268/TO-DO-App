/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#a78bfa', // light purple
          DEFAULT: '#8b5cf6', // main purple
          dark: '#6d28d9', // darker purple
        },
        surface: {
          light: '#ffffff',
          dark: '#1e1e2f',
        },
        text: {
          light: '#111827',
          dark: '#f3f4f6',
        },
      },
    },
  },
  plugins: [],
};
