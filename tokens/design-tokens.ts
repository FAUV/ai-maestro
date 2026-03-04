export const colorTokens = {
  bg: 'oklch(0.98 0.002 247)',
  surface: 'rgba(255,255,255,0.58)',
  surfaceStrong: 'rgba(255,255,255,0.72)',
  textPrimary: 'oklch(0.23 0.01 248)',
  textSecondary: 'oklch(0.43 0.02 248)',
  accent: 'oklch(0.69 0.19 251)',
  border: 'rgba(255,255,255,0.46)',
  shadow: 'rgba(15,23,42,0.18)',
}

export const spacingTokens = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  24: 96,
  32: 128,
} as const

export const typographyTokens = {
  display: 'clamp(2.75rem, 8vw, 6rem)',
  largeTitle: 'clamp(2rem, 4.2vw, 3.75rem)',
  title: 'clamp(1.5rem, 3vw, 2.25rem)',
  headline: '1.25rem',
  body: '1rem',
  caption: '0.8125rem',
  trackingTight: '-0.03em',
  trackingNormal: '-0.01em',
}

export const gridTokens = {
  columns: 12,
  maxWidth: 1280,
}
