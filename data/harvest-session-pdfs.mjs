import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const TR = '/Users/ziqianhuang/.claude/projects/-Users-ziqianhuang-haifeng-engines/bcbfd684-b138-4a7a-9647-c6eb4260970e/tool-results'

// PDFs downloaded & content-verified this session (pdftotext fingerprinted).
// { file, type, label, storagePath, slugs:[...] }  — one upload, linked to N engines.
const HARVEST = [
  // ── Single-engine factory datasheet ──────────────────────────────────────
  { file: 'webfetch-1780057896015-k0gkwi.pdf', type: 'datasheet',
    label: 'Cummins QSL9-G5 Engine Performance Datasheet', storagePath: 'cummins/spec-sheets/qsl9-g5.pdf',
    slugs: ['cummins-qsl9-g5'] },

  // ── Engine-specific genset datasheets (packager docs naming the engine) ───
  { file: 'webfetch-1780110341326-pgvo8s.pdf', type: 'brochure',
    label: 'Mitsubishi S12A2-Y2PTAW-2 Genset Datasheet (AKSA APD-ULM800)', storagePath: 'mitsubishi/spec-sheets/s12a2-y2ptaw-2.pdf',
    slugs: ['mitsubishi-s12a2-y2ptaw-2'] },
  { file: 'webfetch-1780110531170-lnr4v8.pdf', type: 'brochure',
    label: 'Mitsubishi S12H-Y2PTAW-1 Genset Datasheet (AKSA APD-ULM1000)', storagePath: 'mitsubishi/spec-sheets/s12h-y2ptaw-1.pdf',
    slugs: ['mitsubishi-s12h-y2ptaw-1'] },
  { file: 'webfetch-1780110337954-bgnn9z.pdf', type: 'brochure',
    label: 'John Deere 6068HFG85 Genset Datasheet (AKSA APD-ULJ200)', storagePath: 'john-deere/spec-sheets/6068hfg85.pdf',
    slugs: ['john-deere-6068hfg85-t3-255kva'] },
  { file: 'webfetch-1780110322127-7mnpju.pdf', type: 'brochure',
    label: 'John Deere 6090HF484 Genset Datasheet (AKSA APD-ULJ250)', storagePath: 'john-deere/spec-sheets/6090hf484.pdf',
    slugs: ['john-deere-6090hf484-t3-310kva', 'john-deere-6090hf484-t3-340kva'] },
  { file: 'webfetch-1780108237861-sw1bjy.pdf', type: 'brochure',
    label: 'Detroit Diesel Series 60 14.0L Genset Spec (Kohler 400REOZD)', storagePath: 'detroit-diesel/spec-sheets/series-60-14l.pdf',
    slugs: ['detroit-diesel-series-60-14-0l'] },
  { file: 'webfetch-1780107988779-v9ax62.pdf', type: 'brochure',
    label: 'Detroit Diesel 8V-92TA Genset Spec (Spectrum 400DS)', storagePath: 'detroit-diesel/spec-sheets/8v-92ta.pdf',
    slugs: ['detroit-diesel-8v-92ta'] },

  // ── Manufacturer series brochures (linked to each engine in the series) ───
  { file: 'webfetch-1780139545610-5g3k6t.pdf', type: 'brochure',
    label: 'MAN POWER — Diesel Engines for Power Generation', storagePath: 'man/brochures/man-power-diesel.pdf',
    slugs: ['man-d2676','man-d2840','man-d2842','man-d2862'] },
  { file: 'webfetch-1780109274668-z65uko.pdf', type: 'brochure',
    label: 'Kohler KD Series Generators Brochure', storagePath: 'kohler/brochures/kd-series.pdf',
    slugs: ['kohler-kd27v12','kohler-kd36v16','kohler-kd45v20','kohler-kd62v12','kohler-kd83v16','kohler-kd103v20'] },
  { file: 'webfetch-1780117197416-24j6zh.pdf', type: 'brochure',
    label: 'Kohler Diesel KDI Power Pack Brochure', storagePath: 'kohler/brochures/kdi-power-pack.pdf',
    slugs: ['kohler-kdi1903tcr','kohler-kdi2504tcr','kohler-kdi3404tcr'] },
  { file: 'webfetch-1780111196646-dgrmaz.pdf', type: 'brochure',
    label: 'Kirloskar R1040 Series Engine Brochure', storagePath: 'kirloskar/brochures/r1040-series.pdf',
    slugs: ['kirloskar-3r1040','kirloskar-4r1040','kirloskar-4r1040t','kirloskar-4r1040ta','kirloskar-6r1080t','kirloskar-6r1080ta'] },
  { file: 'webfetch-1780056821346-f9s5ty.pdf', type: 'brochure',
    label: 'FPT Industrial Tier III Genset Engines — Technical Specifications', storagePath: 'fpt/brochures/fpt-tier3-genset.pdf',
    slugs: ['fpt-nef45sm1x','fpt-nef45sm2x','fpt-nef45-te1p','fpt-nef45-te2p','fpt-nef67-tm1x','fpt-nef67-te1pv','fpt-nef67-te2pv','fpt-nef67-te3pv','fpt-c87-te3f','fpt-c87-te1pv','fpt-c13-te2f'] },
  { file: 'webfetch-1780063921870-t76o2f.pdf', type: 'brochure',
    label: 'Caterpillar Electric Power Ratings Guide', storagePath: 'caterpillar/brochures/electric-power-ratings-guide.pdf',
    slugs: ['caterpillar-c32','caterpillar-3306','caterpillar-3406','caterpillar-3408','caterpillar-3412','caterpillar-3508','caterpillar-c6-6'] },
]

// resolve all slugs -> ids
const allSlugs = [...new Set(HARVEST.flatMap(h => h.slugs))]
const { data: engs } = await supabase.from('engines').select('id, slug').in('slug', allSlugs)
const idOf = Object.fromEntries(engs.map(e => [e.slug, e.id]))

let uploaded = 0, links = 0, skipped = 0
for (const h of HARVEST) {
  const local = `${TR}/${h.file}`
  process.stdout.write(`${h.storagePath} ... `)
  if (!fs.existsSync(local)) { console.log('file missing'); skipped++; continue }
  const buf = fs.readFileSync(local)
  if (buf.slice(0,4).toString() !== '%PDF') { console.log('not a PDF'); skipped++; continue }

  const { ok } = await uploadPdf(supabase, BUCKET, local, h.storagePath)
  if (!ok) { console.log('upload failed/too large'); skipped++; continue }
  uploaded++
  process.stdout.write(`${Math.round(buf.length/1024)}KB → `)

  let n = 0
  for (const slug of h.slugs) {
    const eid = idOf[slug]
    if (!eid) { process.stdout.write(`[miss:${slug}] `); continue }
    await supabase.from('engine_pdfs').delete().eq('engine_id', eid).eq('storage_path', h.storagePath)
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: eid, type: h.type, label: h.label, storage_path: h.storagePath, file_size_bytes: buf.length,
    })
    if (!error) { n++; links++ }
  }
  console.log(`linked to ${n} engine(s)`)
}
console.log(`\n✓ ${uploaded} PDFs uploaded · ${links} engine links · ${skipped} skipped`)
