/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean Pure Light System
        light: {
          bg: '#F8FAFC',        // Canvas Background (slate-50)
          card: '#FFFFFF',      // Pure White Card Surface
          surface: '#F1F5F9',   // Inset / Input / Secondary Surface (slate-100)
          border: '#CBD5E1',    // Clean visible neutral border (slate-300)
          text: '#0F172A',      // High-contrast primary dark charcoal text (slate-900)
          muted: '#64748B',     // Medium gray secondary text (slate-500/600)
        },
        // Fallback Dark mappings ensure no dark/black styling even if legacy classes remain
        dark: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          surface: '#F1F5F9',
          border: '#CBD5E1',
          text: '#0F172A',
          muted: '#64748B',
        },
        // SolarSense Signature Green Accent
        brand: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          dark: '#166534',
          subtle: 'rgba(22, 163, 74, 0.10)',
          green: '#16A34A',
        },
        'brand-green': {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          dark: '#166534',
        },
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
        'input': '10px',
      },
      fontSize: {
        'page-title': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'section-title': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'card-title': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'secondary': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'nav': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'label': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'input': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'btn': ['15px', { lineHeight: '22px', fontWeight: '600' }],
        'helper': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'meta': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'stat': ['32px', { lineHeight: '38px', fontWeight: '700' }],
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.07), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card': '0 1px 4px -1px rgba(15, 23, 42, 0.08), 0 3px 8px -1px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
