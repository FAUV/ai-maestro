import { HTMLAttributes } from 'react'

export function GlassPanel({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/45 bg-white/55 p-6 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.4)] backdrop-blur-2xl ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.44),rgba(255,255,255,.12)_44%,rgba(148,163,184,.18))]" />
      <div className="pointer-events-none absolute inset-x-3 top-2 h-px bg-white/70" />
      <div className="relative">{props.children}</div>
    </div>
  )
}
