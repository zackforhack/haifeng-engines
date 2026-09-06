import 'server-only'
import { cache } from 'react'
import publishedSnapshot from '@/data/public/overhaul-previews.json'
import { createClient } from '@supabase/supabase-js'

export interface OverhaulPreview {
  categories: string[]
  references: { category: string; number: string; name: string; condition: string; sourceName: string | null; verifiedAt: string | null }[]
  localPreview: boolean
  unavailable: boolean
}

type PublishedModel = Pick<OverhaulPreview, 'categories' | 'references'> & { slug: string; brand: string; model: string }
const publishedModels = publishedSnapshot.models as Record<string, PublishedModel>

// Private records stay on the server. Only this bounded DTO reaches the page.
// Production uses only the versioned, bounded public snapshot; it never opens the raw catalog.
// Live private-data review is opt-in and cannot be enabled in a production build.
export const getOverhaulPreview = cache(async (engineId: string): Promise<OverhaulPreview> => {
  const localPreview = process.env.NODE_ENV === 'development' && process.env.LOCAL_OVERHAUL_PREVIEW === '1'
  const empty: OverhaulPreview = { categories: [], references: [], localPreview, unavailable: false }
  if (!localPreview) {
    const published = publishedModels[engineId]
    return published ? { ...empty, categories: published.categories, references: published.references } : empty
  }
  const key = process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!key || !url) return { ...empty, unavailable: true }
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const query = db.from('engine_part_fitments')
      .select('category_code,confidence,fitment_condition,verified_at,overhaul_part_categories(label,sort_order),overhaul_parts!inner(part_number,part_name,status),overhaul_sources!engine_part_fitments_source_id_fkey(source_type,source_name)')
      .eq('engine_id', engineId)
      .eq('fitment_scope', 'model_exact')
      .in('confidence', ['verified', 'likely', 'needs_serial_confirmation'])
      .in('workflow_status', ['reviewed', 'verified', 'published'])
      .eq('overhaul_parts.status', 'active')
      .order('category_code').order('id').limit(200)
    const { data, error } = await query
    if (error) {
      console.error('Overhaul preview unavailable:', error.code)
      return { ...empty, unavailable: true }
    }
    // Explicit shape: never spread a database record into a client prop.
    const rows = (data ?? []) as unknown as {
      category_code: string
      confidence: string
      fitment_condition: string | null
      verified_at: string | null
      overhaul_part_categories: { label: string; sort_order: number } | null
      overhaul_parts: { part_number: string; part_name: string; status: string } | null
      overhaul_sources: { source_type: string; source_name: string | null } | null
    }[]
    rows.sort((a, b) => (a.overhaul_part_categories?.sort_order ?? 999) - (b.overhaul_part_categories?.sort_order ?? 999))
    const categories = [...new Set(rows.flatMap(row => row.overhaul_part_categories ? [row.overhaul_part_categories.label] : []))].slice(0, 8)
    const references: OverhaulPreview['references'] = []
    const usedCategories = new Set<string>()
    for (const row of rows) {
      if (references.length === 3) break
      if (!row.overhaul_parts || !row.overhaul_part_categories || usedCategories.has(row.category_code)) continue
      // The initial number preview is restricted to reviewed OEM-manual evidence.
      if (row.overhaul_sources?.source_type !== 'official_oem_parts_manual') continue
      references.push({
        category: row.overhaul_part_categories.label,
        number: row.overhaul_parts.part_number,
        name: row.overhaul_parts.part_name,
        condition: row.fitment_condition || 'Confirm the engine serial number and configuration before ordering.',
        sourceName: row.overhaul_sources.source_name || null,
        verifiedAt: row.verified_at && Number.isFinite(Date.parse(row.verified_at)) ? row.verified_at : null,
      })
      usedCategories.add(row.category_code)
    }
    return { ...empty, categories, references }
  } catch {
    console.error('Overhaul preview request failed')
    return { ...empty, unavailable: true }
  }
})

// Discover a bounded set of real reference pages for contextual internal links.
// Apply the same publication/evidence gates as the destination, then confirm its DTO.
export const getOverhaulModelLinks = cache(async (brand?: string) => {
  const local = process.env.NODE_ENV === 'development' && process.env.LOCAL_OVERHAUL_PREVIEW === '1'
  if (!local) return Object.values(publishedModels)
    .filter(row => row.references.length && (!brand || row.brand === brand))
    .slice(0, 4).map(row => ({ slug: row.slug, model: row.model, brand: row.brand }))
  const key = process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!key || !url) return []
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    let query = db.from('engine_part_fitments')
      .select('engine_id,engines!inner(slug,model,brand),overhaul_parts!inner(status),overhaul_sources!engine_part_fitments_source_id_fkey!inner(source_type)')
      .eq('fitment_scope', 'model_exact')
      .eq('overhaul_parts.status', 'active')
      .eq('overhaul_sources.source_type', 'official_oem_parts_manual')
      .in('confidence', ['verified', 'likely', 'needs_serial_confirmation'])
      .in('workflow_status', ['reviewed', 'verified', 'published'])
      .order('engine_id').order('id').limit(100)
    if (brand) query = query.eq('engines.brand', brand)
    const { data, error } = await query
    if (error) return []
    const rows = (data ?? []) as unknown as { engine_id: string; engines: { slug: string; model: string; brand: string } }[]
    const unique = [...new Map(rows.map(row => [row.engine_id, row])).values()].slice(0, 4)
    const checked = await Promise.all(unique.map(async row => {
      const preview = await getOverhaulPreview(row.engine_id)
      return preview.references.length ? { slug: row.engines.slug, model: row.engines.model, brand: row.engines.brand } : null
    }))
    return checked.filter((row): row is NonNullable<typeof row> => row !== null)
  } catch {
    return []
  }
})
