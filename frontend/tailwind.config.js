/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'posthog-yellow': '#F9BD2B',
        'posthog-blue': '#1D4AFF',
        'posthog-red': '#F54E00',
        'posthog-purple': '#B62AD9',
      },
    },
  },
  plugins: [],
}
