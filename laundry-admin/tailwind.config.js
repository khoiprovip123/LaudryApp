/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tắt preflight để tránh xung đột với Chakra UI
  corePlugins: {
    preflight: false,
  },
}

