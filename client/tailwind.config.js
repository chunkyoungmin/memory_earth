/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-style minimal neutrals — tune these later in the design pass
        background: '#0a0a0c',
        surface: '#121214',
        accent: '#4da6ff',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
