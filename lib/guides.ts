import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// Guides are authored as Markdown files in content/guides/*.md with frontmatter.
// Add a new guide by dropping in a file — no code changes needed.
const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides')

export interface GuideMeta {
  slug: string
  title: string
  description: string
  keyword?: string
  cluster: string
  order: number
  updated: string
  hero?: string
}

export interface Guide extends GuideMeta {
  html: string
}

export const CLUSTERS = [
  'Power & Sizing',
  'Choosing an Engine',
  'Alternator Basics',
] as const

function readFiles(): { slug: string; raw: string }[] {
  if (!fs.existsSync(GUIDES_DIR)) return []
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), raw: fs.readFileSync(path.join(GUIDES_DIR, f), 'utf8') }))
}

function toMeta(slug: string, data: Record<string, unknown>): GuideMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    keyword: data.keyword ? String(data.keyword) : undefined,
    cluster: String(data.cluster ?? 'Power & Sizing'),
    order: Number(data.order ?? 99),
    updated: String(data.updated ?? new Date().toISOString().slice(0, 10)),
    hero: data.hero ? String(data.hero) : undefined,
  }
}

export function getAllGuides(): GuideMeta[] {
  return readFiles()
    .map(({ slug, raw }) => toMeta(slug, matter(raw).data))
    .sort((a, b) => a.cluster.localeCompare(b.cluster) || a.order - b.order)
}

export function getRelatedGuides(slug: string, limit = 3): GuideMeta[] {
  const guides = getAllGuides()
  const current = guides.find((g) => g.slug === slug)
  if (!current) return []

  const sameCluster = guides.filter((g) => g.slug !== slug && g.cluster === current.cluster)
  const coreGuides = [
    'how-to-choose-a-generator-engine',
    'how-to-size-a-generator',
    'kva-vs-kw',
    'alternator-voltage-and-frequency',
  ]
    .map((coreSlug) => guides.find((g) => g.slug === coreSlug))
    .filter((g): g is GuideMeta => !!g && g.slug !== slug && !sameCluster.some((s) => s.slug === g.slug))

  return [...sameCluster, ...coreGuides].slice(0, limit)
}

export function getGuideBySlug(slug: string): Guide | null {
  const file = readFiles().find((f) => f.slug === slug)
  if (!file) return null
  const { data, content } = matter(file.raw)
  return { ...toMeta(slug, data), html: marked.parse(content, { async: false }) as string }
}
