/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Hyperliquid-inspired trading-terminal palette
        base: '#04110F',        // near-black teal
        panel: '#081A16',       // raised panel
        'panel-2': '#0C2420',   // higher panel
        line: '#16352E',        // grid / hairline
        mint: '#98FCE4',        // HL signature accent
        teal: '#2DD4BF',
        long: '#34D399',        // bid / buy / up
        short: '#FB7185',       // ask / sell / down
        liq: '#FBBF24',         // liquidation amber
        ink: '#E8FFF9',         // primary text
        muted: '#6FA89B',       // secondary text
        faint: '#3E6B60',       // tertiary
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(152,252,228,0.18), 0 0 24px -6px rgba(152,252,228,0.25)',
        'glow-amber': '0 0 0 1px rgba(251,191,36,0.25), 0 0 24px -6px rgba(251,191,36,0.3)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        flicker: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.86' } },
        sweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(200%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both',
        flicker: 'flicker 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
