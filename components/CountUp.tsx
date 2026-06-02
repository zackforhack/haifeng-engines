'use client'

import { useEffect, useState } from 'react'

// Animates a number from 0 up to `end` on mount (easeOutCubic). Renders the real value
// during SSR / first paint (so crawlers and no-JS users see the true number), then counts
// up after hydration. Honors prefers-reduced-motion.
export function CountUp({
  end,
  duration = 1400,
  className,
}: {
  end: number
  duration?: number
  className?: string
}) {
  const [value, setValue] = useState(end)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || end <= 0) return
    let raf = 0
    const start = performance.now()
    // The first frame (t≈0) sets the value to ~0, so no synchronous setState is needed here.
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(end * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setValue(end)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration])

  return <span className={className}>{value.toLocaleString()}</span>
}
