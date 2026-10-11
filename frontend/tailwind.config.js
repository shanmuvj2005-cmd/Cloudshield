/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070a13',
          card: '#0d1322',
          cardHover: '#131b2e',
          border: '#1b253b',
          borderGlow: '#223456',
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          blue: '#3b82f6',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'red-glow': '0 0 15px -3px rgba(239, 68, 68, 0.4)',
        'emerald-glow': '0 0 15px -3px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
