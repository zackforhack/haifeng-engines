'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function EngineSortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? ''

  function update(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) {
      p.set('sort', value)
      p.set('view', 'grid')
    } else {
      p.delete('sort')
    }
    p.delete('page')
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-gray-500">
      <span className="shrink-0">Sort</span>
      <select
        value={sort}
        onChange={(e) => update(e.target.value)}
        aria-label="Sort engines"
        className="min-h-10 min-w-0 border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-blue-600 focus:outline-none"
      >
        <option value="">Brand A to Z</option>
        <option value="kwe_desc">Power high to low</option>
        <option value="kwe_asc">Power low to high</option>
        <option value="disp_desc">Displacement high to low</option>
        <option value="disp_asc">Displacement low to high</option>
      </select>
    </label>
  )
}
