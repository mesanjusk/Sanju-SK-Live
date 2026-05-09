const withOpacity = (v) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `rgb(var(${v}) / 1)`
    : `rgb(var(${v}) / ${opacityValue})`;

const scale = (token) =>
  Object.fromEntries(
    [50,100,200,300,400,500,600,700,800,900].map((n) => [n, withOpacity(`--${token}-${n}-rgb`)])
  );

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        green: scale('green'),
        gray:  scale('gray'),
        gold: {
          DEFAULT: '#C9A227',
          light:   '#E8C547',
          dark:    '#9A7A1A',
          muted:   '#F5E6B8',
        },
        wa: {
          DEFAULT: '#25D366',
          dark:    '#128C7E',
          darkest: '#075E54',
          bubble:  '#DCF8C6',
        },
        red:   { 400:'#f87171', 500:'#ef4444', 600:'#dc2626', 700:'#b91c1c' },
        amber: { 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706' },
        blue:  { 500:'#3b82f6', 600:'#2563eb' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium':      '0 2px 20px -4px rgba(0,0,0,.08), 0 1px 4px -2px rgba(0,0,0,.04)',
        'premium-lg':   '0 20px 60px -12px rgba(0,0,0,.15), 0 4px 16px -4px rgba(0,0,0,.08)',
        'wa':           '0 8px 32px -4px rgba(37,211,102,.35)',
        'wa-lg':        '0 16px 48px -8px rgba(37,211,102,.45)',
        'gold':         '0 8px 32px -4px rgba(201,162,39,.35)',
      },
      transitionDuration: { 400: '400ms' },
      backgroundImage: {
        'gradient-wa':    'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
        'gradient-gold':  'linear-gradient(135deg, #9A7A1A 0%, #C9A227 60%, #E8C547 100%)',
        'gradient-hero':  'linear-gradient(160deg, #075E54 0%, #128C7E 40%, #1a5c4a 70%, #0a2e28 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
