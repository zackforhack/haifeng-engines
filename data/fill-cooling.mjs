// Fill the 19 missing cooling_method values for Hatz & Deutz from model nomenclature.
//   Hatz: D/L/M-series are air-cooled; the H50 series is liquid (water) cooled.
//   Deutz: 914 air-cooled; 2011 (and 1011) oil-cooled; 1013/1015/2013 liquid-cooled.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// model -> cooling_method
const COOLING = {
  // Hatz
  '1D81C': 'Air-Cooled', '2L41C': 'Air-Cooled', '3L41C': 'Air-Cooled', '4L41C': 'Air-Cooled',
  '2M41': 'Air-Cooled', '3M41': 'Air-Cooled', '4M41': 'Air-Cooled',
  '3H50TIC': 'Liquid-Cooled', '4H50TIC': 'Liquid-Cooled',
  // Deutz
  'F6L914': 'Air-Cooled',
  'F3L2011': 'Oil-Cooled', 'F4L2011': 'Oil-Cooled', 'BF4L2011': 'Oil-Cooled', 'BF4M2011': 'Oil-Cooled',
  'BF4M1013': 'Liquid-Cooled', 'BF6M1013': 'Liquid-Cooled', 'TCD2013L6': 'Liquid-Cooled',
  'BF6M1015': 'Liquid-Cooled', 'BF8M1015': 'Liquid-Cooled',
}

let n = 0
for (const [model, cooling] of Object.entries(COOLING)) {
  const { data, error } = await supabase.from('engines').update({ cooling_method: cooling })
    .in('brand', ['Hatz', 'Deutz']).eq('model', model).is('cooling_method', null).select('id')
  if (error) { console.error(`✗ ${model}: ${error.message}`); continue }
  if (data?.length) { n += data.length; console.log(`✓ ${model.padEnd(12)} -> ${cooling} (${data.length})`) }
}
console.log(`\n✓ set cooling_method on ${n} rows`)
