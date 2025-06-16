
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px hsl(var(--accent-glow))' },
          '50%': { opacity: '0.7', boxShadow: '0 0 15px hsl(var(--accent-glow))' },
        },
        'fadeInScale': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fadeInSubtle': {
           '0%': { opacity: '0', transform: 'translateY(8px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulseTextGlow': {
          '0%, 100%': { textShadow: '0 0 6px hsl(var(--primary-glow)), 0 0 8px hsl(var(--primary-glow)/0.6)' },
          '50%': { textShadow: '0 0 10px hsl(var(--primary-glow)), 0 0 16px hsl(var(--primary-glow)/0.6)' },
        },
        'futuristicBgPan': { 
          '0%': { 'background-position': '0% 0%, 0 0, 0 0' },
          '100%': { 'background-position': '100% 100%, 50px 50px, -50px -50px' }
        },
        'futuristicCircuitsMove': { 
          '0%': { transform: 'translateX(0) translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-10px) translateY(5px) rotate(0.5deg)' },
          '50%': { transform: 'translateX(-25px) translateY(0px) rotate(0deg)' },
          '75%': { transform: 'translateX(-10px) translateY(-5px) rotate(-0.5deg)' },
          '100%': { transform: 'translateX(0) translateY(0) rotate(0deg)' }
        },
        'futuristicHudGlow': { 
          '0%': { opacity: '0.1', transform: 'scale(0.9) rotate(-3deg)' },
          '50%': { opacity: '0.3', transform: 'scale(1.1) rotate(3deg)' },
          '100%': { opacity: '0.1', transform: 'scale(0.9) rotate(-3deg)' }
        },
        'bounce': { // Added for typing indicator
          '0%, 100%': { transform: 'translateY(-25%)', 'animation-timing-function': 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'translateY(0)', 'animation-timing-function': 'cubic-bezier(0,0,0.2,1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-scale': 'fadeInScale 0.5s ease-out forwards',
        'fade-in-subtle': 'fadeInSubtle 1s ease-out 0.3s forwards',
        'pulse-text-glow': 'pulseTextGlow 2.5s infinite ease-in-out',
        'futuristic-bg-pan': 'futuristicBgPan 80s linear infinite alternate',
        'futuristic-circuits-move': 'futuristicCircuitsMove 25s linear infinite',
        'futuristic-hud-glow': 'futuristicHudGlow 18s ease-in-out infinite alternate',
        'bounce': 'bounce 1s infinite', // Added for typing indicator
      },
      dropShadow: {
        'glow-primary': '0 0 10px hsl(var(--primary-glow))',
        'glow-accent': '0 0 10px hsl(var(--accent-glow))',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
