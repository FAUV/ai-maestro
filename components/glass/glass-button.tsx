import { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { springPresets } from '@/motion-system/tokens'

export function GlassButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={springPresets.hover}
      className={`rounded-full border border-white/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,.14)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${className}`}
      {...props}
    />
  )
}
