import { ImageResponse } from 'next/og'
import { getAlternatorBySlug } from '@/lib/alternators'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Alternator specifications'

interface Props {
  params: Promise<{ slug: string }>
}

// Per-alternator social preview card (flexbox-only CSS subset, like the engine card).
export default async function Image({ params }: Props) {
  const { slug } = await params
  const a = await getAlternatorBySlug(slug)

  if (!a) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontSize: 56 }}>
          The Generator Engine Encyclopedia
        </div>
      ),
      size,
    )
  }

  const stats: { label: string; value: string }[] = []
  if (a.kva != null) stats.push({ label: 'Nominal prime · 50 Hz', value: `${a.kva.toLocaleString()} kVA` })
  if (a.poles) stats.push({ label: 'Poles', value: `${a.poles}-pole` })
  if (a.series) stats.push({ label: 'Series', value: a.series })

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
          {a.brand} · Alternator
        </div>

        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>
          {a.model}
        </div>

        <div style={{ display: 'flex', flex: 1 }} />

        <div style={{ display: 'flex', gap: 28 }}>
          {stats.slice(0, 3).map((s) => (
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
          <span>The Generator Engine Encyclopedia</span>
          <span>engines.haifengmachinery.com</span>
        </div>
      </div>
    ),
    size,
  )
}
