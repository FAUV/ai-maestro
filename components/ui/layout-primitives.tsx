import { ReactNode } from 'react'
import { gridTokens } from '@/tokens/design-tokens'

type PrimitiveProps = {
  children: ReactNode
  className?: string
}

export function Container({ children, className = '' }: PrimitiveProps) {
  return (
    <div className={`mx-auto w-full px-6 md:px-10 ${className}`} style={{ maxWidth: gridTokens.maxWidth }}>
      {children}
    </div>
  )
}

export function Section({ children, className = '' }: PrimitiveProps) {
  return <section className={`py-16 md:py-24 ${className}`}>{children}</section>
}

export function Stack({ children, className = '' }: PrimitiveProps) {
  return <div className={`flex flex-col gap-6 ${className}`}>{children}</div>
}

export function Grid({ children, className = '' }: PrimitiveProps) {
  return <div className={`grid grid-cols-1 gap-6 md:grid-cols-12 ${className}`}>{children}</div>
}

export function Cluster({ children, className = '' }: PrimitiveProps) {
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
}
