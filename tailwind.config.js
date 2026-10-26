/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        butter: 'var(--butter)',
        sage: 'var(--sage)',
        walnut: 'var(--walnut)',
        terra: 'var(--terra)',
        tomato: 'var(--tomato)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
