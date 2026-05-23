// Inserts all 57 DCEC (Dongfeng Cummins) engine records into Supabase
// Source: 东康电子档型谱2026.pdf

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'Cummins', status: 'active',
  rpm_rated: 1500, fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
  origin: 'China',
}
const I4 = { cylinders: 4, configuration: 'Inline 4' }
const I6 = { cylinders: 6, configuration: 'Inline 6' }

function r(model, series, slug, extra, p50kw, s50kw, p50kwe, p50kva, s50kwe, s50kva, p60kw, s60kw, p60kwe, p60kva, s60kwe, s60kva) {
  return {
    ...BASE, model, series, slug, ...extra,
    prime_power_kw_50hz:    p50kw  ?? null,
    standby_power_kw_50hz:  s50kw  ?? null,
    prime_power_kwe_50hz:   p50kwe ?? null,
    prime_power_kva_50hz:   p50kva ?? null,
    standby_power_kwe_50hz: s50kwe ?? null,
    standby_power_kva_50hz: s50kva ?? null,
    prime_power_kw_60hz:    p60kw  ?? null,
    standby_power_kw_60hz:  s60kw  ?? null,
    prime_power_kwe_60hz:   p60kwe ?? null,
    prime_power_kva_60hz:   p60kva ?? null,
    standby_power_kwe_60hz: s60kwe ?? null,
    standby_power_kva_60hz: s60kva ?? null,
  }
}

const S3 = { emissions_standard: 'China Nonroad Stage III' }

const records = [
  // ── 三阶段 QSB3.9 (Stage III, 50Hz only) ────────────────────────────────
  r('QSB3.9-G2',  'QSB3.9 Series', 'cummins-qsb39-g2',  {...I4, displacement_l:3.9, ...S3},  63, 70, 48, 56, 60, 70),
  r('QSB3.9-G3',  'QSB3.9 Series', 'cummins-qsb39-g3',  {...I4, displacement_l:3.9, ...S3},  79, 88, 64, 72, 80, 90),

  // ── 三阶段 QSB5.9 (Stage III, 50Hz only) ────────────────────────────────
  r('QSB5.9-G2',  'QSB5.9 Series', 'cummins-qsb59-g2',  {...I6, displacement_l:5.9, ...S3},  96, 106, 80,  88,  100, 110),
  r('QSB5.9-G3',  'QSB5.9 Series', 'cummins-qsb59-g3',  {...I6, displacement_l:5.9, ...S3}, 120, 132, 100, 112, 125, 140),

  // ── 三阶段 QSB6.7 (Stage III, 50Hz only) ────────────────────────────────
  r('QSB6.7-G3',  'QSB6.7 Series', 'cummins-qsb67-g3',  {...I6, displacement_l:6.7, ...S3}, 151, 166, 120, 132, 150, 165),
  r('QSB6.7-G4',  'QSB6.7 Series', 'cummins-qsb67-g4',  {...I6, displacement_l:6.7, ...S3}, 168, 185, 144, 160, 180, 200),

  // ── 三阶段 QSL8.9 (Stage III, 50Hz only) ────────────────────────────────
  r('QSL8.9-G2',  'QSL8.9 Series', 'cummins-qsl89-g2',  {...I6, displacement_l:8.9, ...S3}, 206, 226, 160, 176, 200, 220),
  r('QSL8.9-G3',  'QSL8.9 Series', 'cummins-qsl89-g3',  {...I6, displacement_l:8.9, ...S3}, 220, 242, 180, 200, 225, 250),
  r('QSL8.9-G4',  'QSL8.9 Series', 'cummins-qsl89-g4',  {...I6, displacement_l:8.9, ...S3}, 235, 258, 200, 220, 250, 275),

  // ── 三阶段 QSZ13 (Stage III, 50Hz + 60Hz) ───────────────────────────────
  r('QSZ13-G6',   'QSZ13 Series',  'cummins-qsz13-g6',  {...I6, displacement_l:13,  ...S3}, 328, 374, 288, 320, 360, 400, 360, 410, 310, 340, 388, 425),
  r('QSZ13-G7',   'QSZ13 Series',  'cummins-qsz13-g7',  {...I6, displacement_l:13,  ...S3}, 367, 419, 320, 360, 400, 450, 409, 467, 360, 390, 450, 488),

  // ── 新产品 QSB3.9 (50Hz only) ────────────────────────────────────────────
  r('QSB3.9-G31', 'QSB3.9 Series', 'cummins-qsb39-g31', {...I4, displacement_l:3.9},  25,  27,  20,  22,  25,  28),
  r('QSB3.9-G33', 'QSB3.9 Series', 'cummins-qsb39-g33', {...I4, displacement_l:3.9},  36,  40,  30,  33,  38,  42),
  r('QSB3.9-G35', 'QSB3.9 Series', 'cummins-qsb39-g35', {...I4, displacement_l:3.9},  58,  64,  50,  55,  63,  69),
  r('QSB3.9-G37', 'QSB3.9 Series', 'cummins-qsb39-g37', {...I4, displacement_l:3.9},  84,  92,  70,  75,  88,  94),
  r('QSB3.9-G39', 'QSB3.9 Series', 'cummins-qsb39-g39', {...I4, displacement_l:3.9}, 100, 110,  80,  88, 100, 110),

  // ── 新产品 QSB5.9 (50Hz only) ────────────────────────────────────────────
  r('QSB5.9-G30', 'QSB5.9 Series', 'cummins-qsb59-g30', {...I6, displacement_l:5.9}, 116, 128,  90, 100, 112, 125),
  r('QSB5.9-G31', 'QSB5.9 Series', 'cummins-qsb59-g31', {...I6, displacement_l:5.9}, 132, 145, 100, 120, 125, 150),
  r('QSB5.9-G33', 'QSB5.9 Series', 'cummins-qsb59-g33', {...I6, displacement_l:5.9}, 159, 175, 120, 132, 150, 165),

  // ── 新产品 QSB6.7 (50Hz only) ────────────────────────────────────────────
  r('QSB6.7-G32', 'QSB6.7 Series', 'cummins-qsb67-g32', {...I6, displacement_l:6.7}, 173, 190, 150, 165, 188, 206),
  r('QSB6.7-G31', 'QSB6.7 Series', 'cummins-qsb67-g31', {...I6, displacement_l:6.7}, 209, 230, 180, 200, 225, 250),

  // ── 新产品 QSL8.9 (50Hz only) ────────────────────────────────────────────
  r('QSL8.9-G34', 'QSL8.9 Series', 'cummins-qsl89-g34', {...I6, displacement_l:8.9}, 238, 260, 200, 220, 250, 275),
  r('QSL8.9-G33', 'QSL8.9 Series', 'cummins-qsl89-g33', {...I6, displacement_l:8.9}, 270, 292, 230, 250, 288, 312),
  r('QSL8.9-G30', 'QSL8.9 Series', 'cummins-qsl89-g30', {...I6, displacement_l:8.9}, 301, 331, 256, 280, 320, 350),

  // ── B3.9 Series ──────────────────────────────────────────────────────────
  r('4B3.9-G11',   'B3.9 Series', 'cummins-4b39-g11',   {...I4, displacement_l:3.9}, 20,  22,  17,  19,  20,  24,  23, 26, 20, 22, 25, 28),
  r('4B3.9-G1',    'B3.9 Series', 'cummins-4b39-g1',    {...I4, displacement_l:3.9}, 24,  27,  22,  24,  27,  30),
  r('4B3.9-G2',    'B3.9 Series', 'cummins-4b39-g2',    {...I4, displacement_l:3.9}, 24,  27,  22,  24,  27,  30,  30, 33, 24, 27, 30, 34),
  r('4B3.9-G12',   'B3.9 Series', 'cummins-4b39-g12',   {...I4, displacement_l:3.9}, 27,  30,  25,  27,  30,  34,  33, 36, 28, 30, 35, 38),
  r('4BT3.9-G1',   'B3.9 Series', 'cummins-4bt39-g1',   {...I4, displacement_l:3.9}, 36,  40,  32,  35,  40,  44),
  r('4BT3.9-G2',   'B3.9 Series', 'cummins-4bt39-g2',   {...I4, displacement_l:3.9}, 36,  40,  32,  35,  40,  44,  40, 44, 36, 40, 45, 50),
  r('4BTA3.9-G2',  'B3.9 Series', 'cummins-4bta39-g2-g45e1', {...I4, displacement_l:3.9}, 50, 55, 45, 50, 56, 62, 60, 66, 51, 56, 64, 70),
  r('4BTA3.9-G2',  'B3.9 Series', 'cummins-4bta39-g2-g52e1', {...I4, displacement_l:3.9}, 58, 64, 52, 56, 65, 70, 67, 74, 60, 68, 75, 85),
  r('4BTA3.9-G11', 'B3.9 Series', 'cummins-4bta39-g11', {...I4, displacement_l:3.9}, 70,  80,  64,  72,  80,  90,  80, 90, 72, 80, 90, 100),
  r('4BTA3.9-G13', 'B3.9 Series', 'cummins-4bta39-g13', {...I4, displacement_l:3.9}, 87,  97,  76,  84,  95,  105),
  r('4BTAA3.9-G3', 'B3.9 Series', 'cummins-4btaa39-g3', {...I4, displacement_l:3.9}, 96, 106,  80,  88, 100,  110),

  // ── B5.9 Series ──────────────────────────────────────────────────────────
  r('6BT5.9-G1',    'B5.9 Series', 'cummins-6bt59-g1',      {...I6, displacement_l:5.9},  86,  92,  75,  82,  94, 103),
  r('6BT5.9-G2',    'B5.9 Series', 'cummins-6bt59-g2-g75e1',{...I6, displacement_l:5.9},  86,  92,  75,  82,  94, 103, 100, 110, 84,  92, 105, 115),
  r('6BT5.9-G2',    'B5.9 Series', 'cummins-6bt59-g2-g84e1',{...I6, displacement_l:5.9},  96, 106,  84,  92, 105, 115, 115, 127, 100, 110, 125, 138),
  r('6BTA5.9-G2',   'B5.9 Series', 'cummins-6bta59-g2',     {...I6, displacement_l:5.9}, 106, 116,  92, 100, 115, 125, 120, 132, 105, 116, 131, 145),
  r('6BTAA5.9-G2',  'B5.9 Series', 'cummins-6btaa59-g2',    {...I6, displacement_l:5.9}, 120, 130, 108, 116, 135, 145, 132, 145, 116, 125, 145, 156),
  r('6BTAA5.9-G12', 'B5.9 Series', 'cummins-6btaa59-g12',   {...I6, displacement_l:5.9}, 140, 155, 120, 132, 150, 165, 150, 165, 128, 140, 160, 175),

  // ── C8.3 Series ──────────────────────────────────────────────────────────
  r('6CTA8.3-G1',   'C8.3 Series', 'cummins-6cta83-g1',  {...I6, displacement_l:8.3}, 163, 180, 145, 160, 180, 200),
  r('6CTA8.3-G2',   'C8.3 Series', 'cummins-6cta83-g2',  {...I6, displacement_l:8.3}, 163, 180, 145, 160, 180, 200, 170, 187, 152, 167, 190, 209),
  r('6CTAA8.3-G2',  'C8.3 Series', 'cummins-6ctaa83-g2', {...I6, displacement_l:8.3}, 183, 203, 160, 172, 200, 215, 190, 210, 168, 184, 210, 230),
  r('6CTAA8.3-G9',  'C8.3 Series', 'cummins-6ctaa83-g9', {...I6, displacement_l:8.3}, null, 231, null, 200, null, 250, null, 263, null, 220, null, 275),

  // ── L8.9 Series ──────────────────────────────────────────────────────────
  r('6LTAA8.9-G2', 'L8.9 Series', 'cummins-6ltaa89-g2', {...I6, displacement_l:8.9}, 220, 240, 200, 211, 250, 264, 235, 258, 208, 228, 260, 285),
  r('6LTAA8.9-G3', 'L8.9 Series', 'cummins-6ltaa89-g3', {...I6, displacement_l:8.9}, 230, 250, 200, 220, 250, 275, 255, 282, 224, 248, 280, 310),

  // ── L9.5 Series ──────────────────────────────────────────────────────────
  r('6LTAA9.5-G1', 'L9.5 Series', 'cummins-6ltaa95-g1', {...I6, displacement_l:9.5}, 250, 280, 216, 240, 270, 300, 280, 310, 256, 280, 320, 350),
  r('6LTAA9.5-G3', 'L9.5 Series', 'cummins-6ltaa95-g3', {...I6, displacement_l:9.5}, 290, 320, 256, 280, 320, 350, 265, 290, 228, 252, 285, 315),

  // ── Z13 Series ───────────────────────────────────────────────────────────
  r('6ZTAA13-G3', 'Z13 Series', 'cummins-6ztaa13-g3', {...I6, displacement_l:13}, 340, 380, 310, 340, 388, 425, 340, 380, 310, 340, 388, 425),
  r('6ZTAA13-G2', 'Z13 Series', 'cummins-6ztaa13-g2', {...I6, displacement_l:13}, 390, 415, 350, 380, 438, 475, 390, 415, 350, 380, 438, 475),
  r('6ZTAA13-G4', 'Z13 Series', 'cummins-6ztaa13-g4', {...I6, displacement_l:13}, 400, 415, 350, 380, 438, 475, 400, 415, 350, 380, 438, 475),

  // ── QSZ13 Series (non-Stage-III variants) ────────────────────────────────
  r('QSZ13-G2',  'QSZ13 Series', 'cummins-qsz13-g2',  {...I6, displacement_l:13}, 400, 440, 350, 375, 438, 468, 400, 440, 350, 375, 438, 468),
  r('QSZ13-G3',  'QSZ13 Series', 'cummins-qsz13-g3',  {...I6, displacement_l:13}, 450, 470, 380, 400, 475, 500, 450, 500, 380, 400, 475, 500),
  r('QSZ13-G5',  'QSZ13 Series', 'cummins-qsz13-g5',  {...I6, displacement_l:13}, 411, 470, 360, 400, 450, 500, 437, 500, 380, 420, 475, 525),
  r('QSZ13-G10', 'QSZ13 Series', 'cummins-qsz13-g10', {...I6, displacement_l:13}, 463, 509, 400, 440, 500, 550),
  r('QSZ13-G11', 'QSZ13 Series', 'cummins-qsz13-g11', {...I6, displacement_l:13}, null, null, null, null, null, null, 512, 563, 440, 480, 550, 600),
]

console.log(`Upserting ${records.length} DCEC engine records...`)

const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message, error.details); process.exit(1) }

console.log(`Done. ${records.length} records upserted.`)

const bySeries = {}
for (const e of records) bySeries[e.series] = (bySeries[e.series] || 0) + 1
console.log('\nBy series:')
for (const [s, n] of Object.entries(bySeries)) console.log(`  ${s}: ${n} models`)
