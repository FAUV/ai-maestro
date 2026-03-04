'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { GlassPanel } from '@/components/glass/glass-panel'
import { GlassButton } from '@/components/glass/glass-button'
import { Container, Grid, Section, Stack } from '@/components/ui/layout-primitives'
import { GlassHeroCanvas } from '@/webgl/glass-hero-canvas'
import { CursorPhysics } from './_components/cursor-physics'
import { ScrollReveal } from './_components/scroll-reveal'

export default function StudioLandingPage() {
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.94])

  return (
    <>
      <CursorPhysics />
      <Section className="pt-2">
        <Container>
          <motion.div style={{ scale: heroScale }}>
            <GlassPanel className="relative min-h-[70vh] overflow-hidden p-8 md:p-12">
              <div className="absolute inset-0">
                <GlassHeroCanvas />
              </div>
              <div className="relative z-10 max-w-3xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-slate-700">Apple-grade interface platform</p>
                <h1 className="text-[clamp(2.5rem,8vw,5.75rem)] font-semibold tracking-[-0.035em] text-slate-900">Precision glass storytelling for modern products.</h1>
                <p className="mt-6 max-w-2xl text-lg text-slate-700">A complete design + motion system with physically plausible glass surfaces, calm interactions, and WebGL depth rendering.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <GlassButton>Explore architecture</GlassButton>
                  <GlassButton className="bg-sky-500/80 text-white">Review motion system</GlassButton>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Grid>
            {[
              ['Architecture planning', 'Systemized folders for tokens, motion, components, and WebGL feature ownership.'],
              ['Design + motion tokens', 'Shared semantic scales for type, spacing, color, and animation timing.'],
              ['Interaction physics', 'Magnetic hover response and cursor diffusion to support focus and depth.'],
            ].map(([title, body], index) => (
              <ScrollReveal key={title} className="md:col-span-4">
                <GlassPanel className="h-full" style={{ animationDelay: `${index * 60}ms` }}>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
                </GlassPanel>
              </ScrollReveal>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <ScrollReveal>
            <GlassPanel>
              <Stack>
                <h2 className="text-[clamp(1.6rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]">Scroll storytelling engine</h2>
                <p className="max-w-3xl text-slate-700">Sections reveal with a staggered cadence, while hero context softly recedes on scroll. Every movement is GPU-safe using transform + opacity for stable 60fps performance.</p>
              </Stack>
            </GlassPanel>
          </ScrollReveal>
        </Container>
      </Section>
    </>
  )
}
