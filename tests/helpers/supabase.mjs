import { createClient } from '@supabase/supabase-js'
import { loadLocalEnv, requireEnv } from './env.mjs'

const PAGE_SIZE = 1000

export function createPublicCatalogClient() {
  loadLocalEnv()
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )
}

export async function fetchAll(supabase, table, select = '*') {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}
