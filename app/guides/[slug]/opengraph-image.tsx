import { ImageResponse } from 'next/og'
import { getGuideBySlug } from '@/lib/guides'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Generator engine guide'

interface Props {
  params: Promise<{ slug: string }>
}

// Per-guide social card so every article has a branded OG/Twitter image.
export default async function Image({ params }: Props) {
  const { slug } = await params
  const g = getGuideBySlug(slug)
  const title = g?.title ?? 'Generator Engine Guides'
  const cluster = g?.cluster ?? 'Guides'

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
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: 4, color: '#93c5fd', textTransform: 'uppercase' }}>
          Guide · {cluster}
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: title.length > 48 ? 64 : 76, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#94a3b8' }}>
          <span>The Generator Engine Encyclopedia</span>
          <span>engines.haifengmachinery.com</span>
        </div>
      </div>
    ),
    size,
  )
}
