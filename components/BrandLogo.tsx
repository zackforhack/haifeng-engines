import { BRAND_LOGOS } from '@/lib/brand-logos'

// Renders an official brand logo in a uniform, fixed-height box so every brand's mark appears
// at the same visual size regardless of its native aspect ratio (object-contain). Returns null
// for brands without a known logo, so callers don't need to branch.
// White chip + padding so logos (which are designed for light backgrounds, often dark
// wordmarks) stay legible on the dark theme. The white background is an inline style so the
// dark-theme `.bg-white` remap doesn't darken it.
const SIZES = {
  sm: { box: 'h-6 px-1.5', img: 'max-h-4 max-w-[80px]' },
  md: { box: 'h-12 px-2.5', img: 'max-h-8 max-w-[150px]' },
  lg: { box: 'h-16 px-3', img: 'max-h-11 max-w-[200px]' },
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
    <span
      className={`inline-flex items-center justify-center rounded-md ${s.box} ${className}`}
      style={{ backgroundColor: '#fff' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logos; next/image adds no value */}
      <img src={src} alt={`${brand} logo`} className={`${s.img} w-auto object-contain`} loading="lazy" />
    </span>
  )
}
