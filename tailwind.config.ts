import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--void) / <alpha-value>)',
        slate: 'rgb(var(--slate) / <alpha-value>)',
        ash: 'rgb(var(--ash) / <alpha-value>)',
        bone: 'rgb(var(--bone) / <alpha-value>)',
        signal: 'rgb(var(--signal) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
      },
      maxWidth: {
        shell: '1440px',
      },
    },
  },
  plugins: [],
}

export default config