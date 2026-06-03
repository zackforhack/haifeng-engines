export type EngineStatus = 'active' | 'discontinued' | 'limited'

export interface Engine {
  id: string
  slug: string
  brand: string
  model: string
  series?: string
  status: EngineStatus
  year_introduced?: number
  year_discontinued?: number

  // Legacy single power field (kept for backwards compat)
  power_kw?: number
  power_hp?: number

  // Detailed power ratings — 50Hz / 1500 RPM
  prime_power_kw_50hz?: number
  prime_power_kwe_50hz?: number
  prime_power_kva_50hz?: number
  standby_power_kw_50hz?: number
  standby_power_kwe_50hz?: number
  standby_power_kva_50hz?: number

  // Detailed power ratings — 60Hz / 1800 RPM
  prime_power_kw_60hz?: number
  prime_power_kwe_60hz?: number
  prime_power_kva_60hz?: number
  standby_power_kw_60hz?: number
  standby_power_kwe_60hz?: number
  standby_power_kva_60hz?: number

  displacement_l?: number
  cylinders?: number
  configuration?: string

  rpm_rated?: number
  rpm_max?: number
  fuel_consumption_l_per_hr?: number
  compression_ratio?: string

  weight_kg?: number
  length_mm?: number
  width_mm?: number
  height_mm?: number

  fuel_type?: string
  ignition_type?: string
  cooling_method?: string

  emissions_standard?: string
  certifications?: string[]
  compatible_generator_brands?: string[]

  origin?: string
  description?: string
  pdfs?: EnginePDF[]

  created_at: string
  updated_at: string
}

// Lean by design: the catalog lists each model and links its official spec sheet
// (which carries the full voltage/RPM/winding ratings) rather than replicating them.
export interface Alternator {
  id: string
  slug: string
  brand: string
  model: string
  series?: string        // readable family, e.g. PI734, S4L1D, HCI634
  poles?: number         // 2 / 4 / 6
  kva?: number           // nominal prime kVA @ 50Hz — browse/sort only
  spec_sheet_url?: string // official manufacturer data-sheet link
  status: string

  created_at: string
  updated_at: string
}

export interface EnginePDF {
  id: string
  engine_id: string
  type: 'datasheet' | 'manual' | 'brochure' | 'other'
  label: string
  storage_path: string
  file_size_bytes?: number
  created_at: string
}
