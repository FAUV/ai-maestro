'use client'

import { motion } from 'framer-motion'
import { GlassButton } from '@/components/glass/glass-button'
import { GlassPanel } from '@/components/glass/glass-panel'
import { Cluster, Container, Grid, Section } from '@/components/ui/layout-primitives'

export default function ComponentsShowcasePage() {
  return (
    <Section className="pt-2">
      <Container className="space-y-6">
        <GlassPanel>
          <h1 className="text-4xl font-semibold tracking-tight">Interactive Components</h1>
          <p className="mt-3 text-slate-700">Reusable glass primitives with hover, focus, and subtle motion response.</p>
        </GlassPanel>

        <Grid>
          <GlassPanel className="md:col-span-7">
            <h2 className="text-lg font-semibold">Buttons + nav cluster</h2>
            <Cluster className="mt-4">
              <GlassButton>Primary action</GlassButton>
              <GlassButton className="bg-slate-900/80 text-white">Secondary</GlassButton>
              <GlassButton>Ghost control</GlassButton>
            </Cluster>
          </GlassPanel>

          <GlassPanel className="md:col-span-5">
            <h2 className="text-lg font-semibold">Content panel</h2>
            <p className="mt-3 text-sm text-slate-700">Frosted diffusion, edge highlight, and depth shadow tuned for readability.</p>
          </GlassPanel>

          {['Navigation bar', 'Glass card', 'Container'].map((name, i) => (
            <motion.div key={name} className="md:col-span-4" whileHover={{ y: -4 }} transition={{ duration: 0.24 }}>
              <GlassPanel>
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-2 text-sm text-slate-700">Focusable, keyboard-safe, and motion calibrated for calm interaction.</p>
              </GlassPanel>
            </motion.div>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
