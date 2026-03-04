import { GlassPanel } from '@/components/glass/glass-panel'
import { Container, Grid, Section } from '@/components/ui/layout-primitives'
import { colorTokens, spacingTokens, typographyTokens } from '@/tokens/design-tokens'
import { motionDurations } from '@/motion-system/tokens'

export default function DesignSystemPage() {
  return (
    <Section className="pt-2">
      <Container className="space-y-6">
        <GlassPanel>
          <h1 className="text-4xl font-semibold tracking-tight">Design System</h1>
          <p className="mt-3 text-slate-700">Typography, spacing, color, and motion tokens aligned to calm Apple-style interfaces.</p>
        </GlassPanel>

        <Grid>
          <GlassPanel className="md:col-span-6">
            <h2 className="text-xl font-semibold">Typography scale</h2>
            <div className="mt-4 space-y-2 text-slate-800">
              <p style={{ fontSize: typographyTokens.display, letterSpacing: typographyTokens.trackingTight }}>Display</p>
              <p style={{ fontSize: typographyTokens.largeTitle }}>LargeTitle</p>
              <p style={{ fontSize: typographyTokens.title }}>Title</p>
              <p style={{ fontSize: typographyTokens.headline }}>Headline</p>
              <p style={{ fontSize: typographyTokens.body }}>Body</p>
              <p style={{ fontSize: typographyTokens.caption }}>Caption</p>
            </div>
          </GlassPanel>

          <GlassPanel className="md:col-span-6">
            <h2 className="text-xl font-semibold">Color palette</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Object.entries(colorTokens).map(([name, value]) => (
                <div key={name} className="rounded-2xl border border-white/50 p-3">
                  <div className="h-10 rounded-lg" style={{ background: value }} />
                  <p className="mt-2 text-sm font-medium">{name}</p>
                  <p className="text-xs text-slate-600">{value}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="md:col-span-6">
            <h2 className="text-xl font-semibold">Spacing (4px base)</h2>
            <div className="mt-4 space-y-2">
              {Object.values(spacingTokens).map((space) => (
                <div key={space} className="flex items-center gap-3">
                  <div className="h-3 rounded-full bg-sky-400" style={{ width: space * 2 }} />
                  <span className="text-sm text-slate-700">{space}px</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="md:col-span-6">
            <h2 className="text-xl font-semibold">Motion tokens</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {Object.entries(motionDurations).map(([name, duration]) => (
                <li key={name}>
                  <strong className="text-slate-900">{name}</strong>: {(duration * 1000).toFixed(0)}ms
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Grid>
      </Container>
    </Section>
  )
}
