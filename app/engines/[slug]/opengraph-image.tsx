import { ImageResponse } from 'next/og'
import { getEngineBySlug } from '@/lib/engines'
import { headlinePower, displayKva, displayOutput, ratedSpeeds } from '@/lib/engine-display'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Diesel engine specifications'

interface Props {
  params: Promise<{ slug: string }>
}

// Per-engine social preview card. Only flexbox + a subset of CSS work in ImageResponse,
// so the layout is intentionally simple.
export default async function Image({ params }: Props) {
  const { slug } = await params
  const engine = await getEngineBySlug(slug)

  if (!engine) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontSize: 56 }}>
          Diesel Engine Encyclopedia
        </div>
      ),
      size,
    )
  }

  const hp = headlinePower(engine)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const { rpm50, rpm60 } = ratedSpeeds(engine)
  const speed = hp ? (hp.hz === 60 ? rpm60 : rpm50) : rpm50

  const stats: { label: string; value: string }[] = []
  if (kva) stats.push({ label: `${hp?.rating ?? 'Standby'} · ${hp?.hz ?? 50} Hz`, value: `${kva.toLocaleString()} kVA` })
  if (out) stats.push({ label: 'Output', value: `${out.value.toLocaleString()} ${out.unit}` })
  if (engine.displacement_l) stats.push({ label: 'Displacement', value: `${engine.displacement_l} L` })
  if (engine.configuration || engine.cylinders) stats.push({ label: 'Cylinders', value: engine.configuration ?? String(engine.cylinders) })
  if (!kva) stats.push({ label: 'Speed', value: `${speed.toLocaleString()} RPM` })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: 'white',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 4, color: '#93c5fd', textTransform: 'uppercase' }}>
          {engine.brand}
        </div>

        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>
          {engine.model}
        </div>

        {engine.series && (
          <div style={{ display: 'flex', fontSize: 32, color: '#cbd5e1', marginTop: 8 }}>{engine.series}</div>
        )}

        <div style={{ display: 'flex', flex: 1 }} />

        <div style={{ display: 'flex', gap: 28 }}>
          {stats.slice(0, 4).map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '20px 28px',
              }}
            >
              <div style={{ display: 'flex', fontSize: 22, color: '#93c5fd' }}>{s.label}</div>
              <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 44, fontSize: 26, color: '#94a3b8' }}>
          <span>Diesel Engine Encyclopedia</span>
          <span>engines.haifengmachinery.com</span>
        </div>
      </div>
    ),
    size,
  )
}
