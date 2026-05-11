import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        goblin: {
          green: '#39FF14',
          amber: '#FFB000',
          dim: '#1a7a05',
          dark: '#0a1a02',
          black: '#000000',
          red: '#FF4500',
          cyan: '#00FFFF',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        flicker: 'flicker 0.15s infinite',
        'text-glow': 'textGlow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-in',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.9' },
          '10%': { opacity: '0.97' },
          '15%': { opacity: '0.93' },
          '20%': { opacity: '0.97' },
          '70%': { opacity: '0.94' },
          '72%': { opacity: '0.97' },
          '77%': { opacity: '0.91' },
          '100%': { opacity: '0.97' },
        },
        textGlow: {
          from: { textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14' },
          to: { textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 10px #39FF14, 0 0 20px #39FF1433',
        'glow-amber': '0 0 10px #FFB000, 0 0 20px #FFB00033',
      },
    },
  },
  plugins: [],
};

export default config;
