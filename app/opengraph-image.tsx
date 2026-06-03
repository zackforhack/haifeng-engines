import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'The Generator Engine Encyclopedia'

// Site-wide default social card. Next uses this for any route without its own
// opengraph-image (home, /engines, /alternators, /brands listings).
export default function Image() {
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
          Generator Engine &amp; Alternator Specs
        </div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, marginTop: 16, lineHeight: 1.05 }}>
          The Generator Engine
        </div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 300, lineHeight: 1.05, color: '#cbd5e1' }}>
          Encyclopedia
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#94a3b8', marginTop: 32 }}>
          Diesel &amp; gas engines · alternators · datasheets · every brand
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 26, color: '#94a3b8' }}>
          <span>A free resource by Haifeng Machinery</span>
          <span>engines.haifengmachinery.com</span>
        </div>
      </div>
    ),
    size,
  )
}
