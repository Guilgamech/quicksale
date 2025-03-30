/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Updated professional warehouse/inventory management color palette
        primary: '#2C3E50',    // Dark blue-gray for headers
        secondary: '#34495E',  // Slightly lighter blue-gray
        accent: '#3498DB',     // Bright blue for actions/highlights
        danger: '#E74C3C',     // Red for warnings/delete
        success: '#27AE60',    // Green for success/confirmation
        warning: '#F39C12',    // Orange for caution
        background: '#ECF0F1'  // Light gray background
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      spacing: {
        'safe-top': '40px',
        'safe-bottom': '20px',
      },
      borderRadius: {
        'card': '8px',
      }
    },
  },
  plugins: [],
}