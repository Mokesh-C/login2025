import { Geist, Plus_Jakarta_Sans } from 'next/font/google'
import type { Config } from 'tailwindcss'

export default {
  content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0d0718',
                    100: '#1b1333',
                    80: '#1b1333e0',
                },
                accent: {
                    DEFAULT: '#7c3aed',
                    hover: '#8b5cf6',
                    violet: '#b29bfe',
                    violet2: '#aa8dfd',
                    violet3: '#705df2',
                    cyan: '#68e2e2',
                    conblue: '#6c63ff',
                    frenchgray: '#b8bac0',
                    mystic: '#e0e5ec',
                    first:"#1a0e2e",
                    second:"#2a1a5a",
                    third:"#2d1e6b"
                },
                neutral: {
                    white: '#ffffff',
                    muted: '#8B949E',
                    chapter: '#adbbd0',
                },
                warning: '#ddae2d',
                danger: '#d53555',
                text: {
                    muted: '#8B949E',
                    'accent-cyan': '#68e2e2',
                },
                background: {
                    DEFAULT: '#0d0718',
                    dark: '#140b29e7',
                },
                foreground: {
                    DEFAULT: '#ededed',
                    dark: '#ededed',
                },
            },
            backgroundImage: {
                'gradient-cash': 'linear-gradient(180deg, #b4a9ff 0%, #705df2 100%)',
                'gradient-light': 'linear-gradient(225deg, #5545b6 0%, #140b29 100%)',
                'gradient-orange': 'linear-gradient(180deg, #ff6651 0%, #ffffff 100%)',
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
                satoshi: ['Satoshi', 'sans-serif'],
                baloo:['Baloo 2', 'sans-serif'],
                inter:['Inter', 'sans-serif'],
            },
            animation: {
                pulse: 'pulse 4s infinite',
                ping: 'ping 8s infinite',
              },
        },
        screens: {
            'mob': '900px', // <--- custom breakpoint at 900px
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
          },
    },
    plugins: [],
} satisfies Config

