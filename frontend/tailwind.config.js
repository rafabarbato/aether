/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aether: {
          bg: {
            primary: '#0E0E0E',
            secondary: '#1a1a1a',
            elevated: '#212121',
            card: '#1a1a1a',
          },
          border: {
            primary: '#2a2a2a',
            elevated: '#333333',
            accent: '#3B82F6',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
            muted: '#707070',
          },
          blue: {
            primary: '#3B82F6',
            dark: '#2563EB',
            light: '#60A5FA',
          },
          accent: {
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#EF4444',
            info: '#60a5fa',
          },
          status: {
            ready: '#6B7280',
            in_progress: '#3B82F6',
            in_review: '#F59E0B',
            done: '#10B981',
          },
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'aether': '0 0 30px rgba(0, 0, 0, 0.8)',
        'aether-lg': '0 0 60px rgba(0, 0, 0, 0.9)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
      },
      letterSpacing: {
        wider: '0.1em',
        widest: '0.15em',
      },
    },
  },
  plugins: [],
};
