const withOpacity = (cssVariable) => ({ opacityValue }) => {
  if (opacityValue === undefined) return `rgb(var(${cssVariable}) / 1)`;
  return `rgb(var(${cssVariable}) / ${opacityValue})`;
};

const scale = (token) => ({
  50:  withOpacity(`--${token}-50-rgb`),
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
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        gray:   scale('color-gray'),
        green:  scale('color-green'),
        accent: scale('color-accent'),
        /* keep standard Tailwind colours available */
        red:    { 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        amber:  { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        blue:   { 500: '#3b82f6', 600: '#2563eb' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.12), 0 4px 6px -2px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in':    'fadeIn 0.5s ease-out both',
        'wa-pulse':   'waPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
