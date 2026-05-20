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

  // Power specs
  power_kw?: number
  power_hp?: number
  displacement_l?: number
  cylinders?: number
  configuration?: string // e.g. "Inline-6", "V8"

  // Performance
  rpm_rated?: number
  rpm_max?: number
  fuel_consumption_l_per_hr?: number
  compression_ratio?: string

  // Physical
  weight_kg?: number
  length_mm?: number
  width_mm?: number
  height_mm?: number

  // Compliance
  emissions_standard?: string
  certifications?: string[]

  // Compatibility
  compatible_generator_brands?: string[]

  // Content
  description?: string

  // Relations
  pdfs?: EnginePDF[]

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
