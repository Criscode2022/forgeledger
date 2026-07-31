/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        surface: '#121214',
        elevated: '#1a1a1e',
        fg: '#f4f4f5',
        muted: '#a1a1aa',
        subtle: '#71717a',
        border: 'rgba(244, 244, 245, 0.1)',
        accent: {
          DEFAULT: '#d4d4d8',
          fg: '#0a0a0b',
        },
        success: '#4ade80',
        warn: '#fbbf24',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.24), 0 8px 24px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
