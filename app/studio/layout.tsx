import Link from 'next/link'
import { ReactNode } from 'react'
import { GlassPanel } from '@/components/glass/glass-panel'
import { Cluster, Container } from '@/components/ui/layout-primitives'

const links = [
  { href: '/studio', label: 'Landing' },
  { href: '/studio/design-system', label: 'Design System' },
  { href: '/studio/components', label: 'Components' },
]

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Container className="py-6">
        <GlassPanel className="p-3">
          <Cluster className="justify-between">
            <Link href="/studio" className="px-3 py-2 text-sm font-semibold tracking-tight">
              Glass Platform
            </Link>
            <nav aria-label="Studio navigation" className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </Cluster>
        </GlassPanel>
      </Container>
      {children}
    </div>
  )
}
