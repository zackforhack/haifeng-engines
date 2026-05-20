import { supabase } from './supabase'
import type { Engine, EnginePDF } from './types'

export async function getAllEngines(): Promise<Engine[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .order('brand', { ascending: true })
    .order('model', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getEngineBySlug(slug: string): Promise<Engine | null> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getEnginesByBrand(brand: string): Promise<Engine[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .ilike('brand', brand)
    .order('model', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAllBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('brand')
    .order('brand', { ascending: true })

  if (error) throw error
  const brands = [...new Set((data ?? []).map((r) => r.brand))]
  return brands
}

export async function searchEngines(query: string): Promise<Engine[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .or(`brand.ilike.%${query}%,model.ilike.%${query}%,series.ilike.%${query}%`)
    .order('brand', { ascending: true })
    .limit(50)

  if (error) throw error
  return data ?? []
}

export function getPDFUrl(storagePath: string): string {
  const { data } = supabase.storage.from('engine-pdfs').getPublicUrl(storagePath)
  return data.publicUrl
}
