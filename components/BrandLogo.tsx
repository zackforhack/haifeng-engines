import { BRAND_LOGOS } from '@/lib/brand-logos'

// Renders an official brand logo in a uniform, fixed-height box so every brand's mark appears
// at the same visual size regardless of its native aspect ratio (object-contain). Returns null
// for brands without a known logo, so callers don't need to branch.
export function BrandLogo({ brand, className = '' }: { brand: string; className?: string }) {
  const src = BRAND_LOGOS[brand]
  if (!src) return null
  return (
    <span className={`inline-flex items-center h-11 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logos; next/image adds no value */}
      <img
        src={src}
        alt={`${brand} logo`}
        className="max-h-11 max-w-[170px] w-auto object-contain"
        loading="lazy"
      />
    </span>
  )
}
