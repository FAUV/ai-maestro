export const motionDurations = {
  micro: 0.12,
  small: 0.18,
  medium: 0.24,
  large: 0.32,
  cinematic: 0.48,
} as const

export const motionEasing = {
  calm: [0.22, 1, 0.36, 1] as const,
  standard: [0.25, 0.1, 0.25, 1] as const,
}

export const springPresets = {
  soft: { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 },
  hover: { type: 'spring', stiffness: 160, damping: 16, mass: 0.6 },
}
