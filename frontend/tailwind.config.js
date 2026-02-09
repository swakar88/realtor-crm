/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#009f7f',
          foreground: '#ffffff',
        },
      },
      boxShadow: {
        'soft': '0 3px 6px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '0.75rem',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};
