'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'
import { useReducedMotionPreference } from '@/utils/use-reduced-motion'

export function CursorPhysics() {
  const reduced = useReducedMotionPreference()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 24, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 24, mass: 0.4 })

  useEffect(() => {
    if (reduced) return
    const move = (event: PointerEvent) => {
      x.set(event.clientX - 80)
      y.set(event.clientY - 80)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [reduced, x, y])

  if (reduced) return null

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-30 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.22),rgba(56,189,248,0))] blur-xl"
      aria-hidden="true"
    />
  )
}
