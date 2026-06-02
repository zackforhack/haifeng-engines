import { BRAND_LOGOS } from '@/lib/brand-logos'

// Renders an official brand logo in a uniform, fixed-height box so every brand's mark appears
// at the same visual size regardless of its native aspect ratio (object-contain). Returns null
// for brands without a known logo, so callers don't need to branch.
const SIZES = {
  sm: { box: 'h-5', img: 'max-h-5 max-w-[88px]' },
  md: { box: 'h-11', img: 'max-h-11 max-w-[170px]' },
  lg: { box: 'h-14', img: 'max-h-14 max-w-[220px]' },
}

export function BrandLogo({
  brand,
  size = 'md',
  className = '',
}: {
  brand: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const src = BRAND_LOGOS[brand]
  if (!src) return null
  const s = SIZES[size]
  return (
    <span className={`inline-flex items-center ${s.box} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logos; next/image adds no value */}
      <img src={src} alt={`${brand} logo`} className={`${s.img} w-auto object-contain`} loading="lazy" />
    </span>
  )
}
