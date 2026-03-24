import { colors } from './src/lib/theme.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        base:    colors.base,
        surface: colors.surface,
        overlay: colors.overlay,
        subtle:  colors.subtle,

        fg: {
          DEFAULT:   colors.fg,
          secondary: colors.fgSecondary,
          tertiary:  colors.fgTertiary,
          muted:     colors.fgMuted,
          faint:     colors.fgFaint,
          ghost:     colors.fgGhost,
        },

        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover:   'rgb(var(--primary-hover) / <alpha-value>)',
          dim:     'rgb(var(--primary-dim) / <alpha-value>)',
          subtle:  'rgb(var(--primary-subtle) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
