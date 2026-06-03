import { ImageResponse } from 'next/og'
import { getEnginesByBrand, getBrandDisplayName } from '@/lib/engines'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Generator engine brand'

interface Props {
  params: Promise<{ brand: string }>
}

// Per-brand social preview card.
export default async function Image({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const [name, engines] = await Promise.all([
    getBrandDisplayName(decoded),
    getEnginesByBrand(decoded),
  ])
  const display = name ?? decoded

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: 'white',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 4, color: '#93c5fd', textTransform: 'uppercase' }}>
          Generator Engines
        </div>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>
          {display}
        </div>
        {engines.length > 0 && (
          <div style={{ display: 'flex', fontSize: 34, color: '#cbd5e1', marginTop: 16 }}>
            {engines.length} models · specs & datasheets
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 26, color: '#94a3b8' }}>
          <span>The Generator Engine Encyclopedia</span>
          <span>engines.haifengmachinery.com</span>
        </div>
      </div>
    ),
    size,
  )
}
