'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

type Props = { children: React.ReactNode; className?: string }

export function ScrollReveal({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
