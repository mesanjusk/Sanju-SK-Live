// tailwind.config.js

const withOpacity = (cssVariable) => ({ opacityValue }) => {
  if (opacityValue === undefined) {
    return `rgb(var(${cssVariable}) / 1)`;
  }
  return `rgb(var(${cssVariable}) / ${opacityValue})`;
};

const scale = (token) => ({
  50: withOpacity(`--${token}-50-rgb`),
  100: withOpacity(`--${token}-100-rgb`),
  200: withOpacity(`--${token}-200-rgb`),
  300: withOpacity(`--${token}-300-rgb`),
  400: withOpacity(`--${token}-400-rgb`),
  500: withOpacity(`--${token}-500-rgb`),
  600: withOpacity(`--${token}-600-rgb`),
  700: withOpacity(`--${token}-700-rgb`),
  800: withOpacity(`--${token}-800-rgb`),
  900: withOpacity(`--${token}-900-rgb`),
});

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        gray: scale('color-gray'),
        red: scale('color-primary'),
        rose: scale('color-primary'),
        pink: scale('color-accent'),
        blue: scale('color-secondary'),
        green: scale('color-success'),
        yellow: scale('color-warning'),
        orange: scale('color-warning'),
        purple: scale('color-accent'),
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
