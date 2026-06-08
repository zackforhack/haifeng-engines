import fs from 'fs'
import path from 'path'

// Fetch official brand logos from Wikimedia. For each brand we resolve its English-Wikipedia
// article -> Wikidata entity, take P154 ("logo image") when present (authoritative), else fall
// back to the infobox lead image (pageimages). Files land in public/brand-logos/<slug>.<ext>
// and a lib/brand-logos.ts manifest maps brand -> public path. Logos are trademarks of their
// respective owners; used here nominatively to identify each engine's manufacturer.
const OUT_DIR = path.join(process.cwd(), 'public', 'brand-logos')
const MANIFEST = path.join(process.cwd(), 'lib', 'brand-logos.ts')
const UA = 'HaifengEngineEncyclopedia/1.0 (logo fetch; contact zackforhack@gmail.com)'

// brand -> best English Wikipedia article title (null = no known article, skip)
const TITLES = {
  'Ashok Leyland': null,          // P154 is a grille-emblem photo; no clean free logo on Commons
  'Baudouin': 'Moteurs Baudouin',
  'Caterpillar': 'Caterpillar Inc.',
  'Cummins': 'Cummins',
  'Daihatsu': 'Daihatsu',
  'Detroit Diesel': 'Detroit Diesel',
  'Deutz': null,                  // P154 is a photo of an old KHD badge; no clean free logo on Commons
  'FAWDE': 'FAW Group',
  'FPT': 'FPT Industrial',
  'Ford': 'Ford Motor Company',
  'Googol': null,
  'Greaves': 'Greaves Cotton',
  'Hatz': 'Motorenfabrik Hatz',
  'Hino': 'Hino Motors',
  'Hyundai': 'Hyundai Motor Company',
  'Isuzu': 'Isuzu',
  'JCB': 'JCB (company)',
  'John Deere': 'John Deere',
  'Kirloskar': 'Kirloskar Oil Engines',
  'Kohler': 'Kohler Co.',
  'Komatsu': 'Komatsu Limited',
  'Kubota': 'Kubota',
  'Liebherr': 'Liebherr Group',
  'Lovol': 'Lovol',
  'MAN': 'MAN SE',
  'MTU': 'MTU Friedrichshafen',
  'Mahindra': 'Mahindra & Mahindra',
  'Mitsubishi': 'Mitsubishi Heavy Industries',
  'PSI': 'Power Solutions International',
  'Perkins': 'Perkins Engines',
  'SDEC': null,
  'Scania': 'Scania AB',
  'VM Motori': 'VM Motori',
  'Volvo Penta': 'Volvo Penta',
  'Weichai': 'Weichai Power',
  'Yanmar': 'Yanmar',
  'Yuchai': 'Guangxi Yuchai Machinery',
  'Yunnei': null,
  // Chinese gas-engine brands with no clean free Wikimedia logo — served from LOCAL_LOGOS.
  // They must be listed here (the emit loop iterates TITLES) or a re-run drops them.
  'Liyu Power': null,
  'PUSH': null,
  'VMAN': null,
  'Xinchai': null,
}

// Curated Commons File: names (found via Commons file search). Takes priority over P154 —
// used both for brands whose Wikidata entity has no P154 claim AND for those whose P154 is
// a photo of a badge/building rather than a clean logo (Deutz/Mahindra/Ashok Leyland).
const DIRECT_FILE = {
  'Greaves': 'Greaves Cotton New Logo.png',
  'Hatz': 'Motorenfabrik Hatz logo.svg',
  'JCB': 'JCB-Logo.jpg',                       // construction JCB (not the JCB card network)
  'Kirloskar': 'Kirloskar Group Logo.svg',
  'Mahindra': 'Mahindra logo.svg',
  // Deutz & Ashok Leyland: Commons only has a route-marker placeholder / a grille-emblem
  // photo respectively — no clean free corporate logo, so they are intentionally omitted.
}

// User-provided logos already placed in public/brand-logos/ (brands with no clean free
// Wikimedia logo, plus a cleaner Lovol than the Commons Weichai-Lovol mark). These take
// priority over the Wikimedia fetch and are kept in the manifest on every re-run.
const LOCAL_LOGOS = {
  'Ashok Leyland': 'ashok-leyland.png',
  'Baudouin': 'baudouin.png',
  'Daihatsu': 'daihatsu.png',   // user-provided red-on-white (P154 was a white-only variant)
  'Deutz': 'deutz.png',
  'FAWDE': 'fawde.png',
  'Googol': 'googol.webp',
  'Komatsu': 'komatsu.png',     // P154 SVGs were white-only variants (invisible on white chip)
  'Liebherr': 'liebherr.png',
  'Liyu Power': 'liyu-power.png',   // site only ships a white "fanbai" logo; recolored dark for the white chip
  'Lovol': 'lovol.png',
  'PSI': 'psi.jpg',
  'PUSH': 'push.png',
  'SDEC': 'sdec.png',
  'VMAN': 'vman.png',
  'Volvo Penta': 'volvo-penta.png',
  'Xinchai': 'xinchai.png',
  'Yanmar': 'yanmar.png',
  'Yuchai': 'yuchai.png',
  'Yunnei': 'yunnei.webp',
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jget = async (url) => (await fetch(url, { headers: { 'User-Agent': UA } })).json()

async function qidFor(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json`
  const d = await jget(url)
  const pages = d?.query?.pages ?? {}
  const p = Object.values(pages)[0]
  return p?.pageprops?.wikibase_item ?? null
}

async function logoFileFromWikidata(qid) {
  const d = await jget(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P154&format=json`)
  const claim = d?.claims?.P154?.[0]
  return claim?.mainsnak?.datavalue?.value ?? null   // Commons filename
}

async function infoboxImage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=original&redirects=1&format=json`
  const d = await jget(url)
  const p = Object.values(d?.query?.pages ?? {})[0]
  return p?.original?.source ?? null   // direct upload.wikimedia.org URL
}

function validImage(buf) {
  if (buf.length < 400) return false
  const head = buf.slice(0, 6).toString('latin1')
  const txt = buf.slice(0, 256).toString('utf8')
  if (head.startsWith('\x89PNG')) return 'png'
  if (head.startsWith('\xFF\xD8\xFF')) return 'jpg'
  if (txt.includes('<svg') || txt.includes('<?xml')) return 'svg'
  if (head.startsWith('GIF8')) return 'gif'
  return false
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const manifest = {}
const report = []

for (const [brand, title] of Object.entries(TITLES)) {
  const slug = slugify(brand)
  // User-provided local logo wins — skip the network fetch entirely.
  if (LOCAL_LOGOS[brand]) {
    const fname = LOCAL_LOGOS[brand]
    if (fs.existsSync(path.join(OUT_DIR, fname))) { manifest[brand] = `/brand-logos/${fname}`; report.push([brand, 'OK', `local → ${fname}`]) }
    else report.push([brand, 'MISS', `local file missing: ${fname}`])
    continue
  }
  if (!title && !DIRECT_FILE[brand]) { report.push([brand, 'SKIP', 'no Wikipedia article / no logo on Commons']); continue }
  try {
    let src = null, via = ''
    // Curated file wins (cleanest logo, or fixes a bad P154 photo).
    if (DIRECT_FILE[brand]) { src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(DIRECT_FILE[brand])}`; via = 'Commons file' }
    if (!src && title) {
      const qid = await qidFor(title)
      if (qid) {
        const file = await logoFileFromWikidata(qid)
        if (file) { src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`; via = `P154 (${qid})` }
      }
    }
    if (!src) { report.push([brand, 'MISS', 'no curated file, no P154 logo claim']); await sleep(120); continue }

    const buf = await download(src)
    const ext = buf && validImage(buf)
    if (!ext) { report.push([brand, 'MISS', `download/validate failed (${via})`]); await sleep(120); continue }

    const fname = `${slug}.${ext}`
    fs.writeFileSync(path.join(OUT_DIR, fname), buf)
    manifest[brand] = `/brand-logos/${fname}`
    report.push([brand, 'OK', `${via} → ${fname} (${Math.round(buf.length / 1024)}KB)`])
  } catch (e) {
    report.push([brand, 'ERR', e.message])
  }
  await sleep(120)
}

// emit manifest
const entries = Object.entries(manifest).sort((a, b) => a[0].localeCompare(b[0]))
const ts = `// Auto-generated by data/fetch-brand-logos.mjs — official brand logos (Wikimedia).
// Logos are trademarks of their respective owners, used nominatively to identify the
// manufacturer of each engine. Re-run the script to refresh.
export const BRAND_LOGOS: Record<string, string> = {
${entries.map(([b, p]) => `  ${JSON.stringify(b)}: ${JSON.stringify(p)},`).join('\n')}
}
`
fs.writeFileSync(MANIFEST, ts)

console.log('\n=== Brand logo fetch report ===')
for (const [b, status, note] of report) console.log(`${status.padEnd(4)} ${b.padEnd(16)} ${note}`)
const ok = report.filter((r) => r[1] === 'OK').length
console.log(`\n${ok}/${Object.keys(TITLES).length} logos saved → public/brand-logos/, manifest → lib/brand-logos.ts`)
