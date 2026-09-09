export interface BrandVideo {
  youtubeId: string
  title: string
}

// Verified against Haifeng Machinery's YouTube channel and oEmbed on 2026-09-09.
// Keys are canonical /brands/[brand] slugs; these are brand stories, not model demos.
const BRAND_VIDEOS: Record<string, BrandVideo> = {
  cummins: {
    youtubeId: 'XZG71-wMRGc',
    title: 'Where Are Cummins Engines Made? The Story Behind the Badge',
  },
  perkins: {
    youtubeId: 'dTtVZ_EuvM0',
    title: 'Perkins: When Your Engine Supplier Joins Your Rival',
  },
  'volvo-penta': {
    youtubeId: 'ExLQFBiQFMQ',
    title: 'Volvo Penta: The Volvo Geely Didn’t Buy',
  },
  baudouin: {
    youtubeId: 'v2Bw9B8L4H8',
    title: 'Baudouin: The French Engine Maker Rescued by Weichai',
  },
  caterpillar: {
    youtubeId: '_IpBB6ftOcg',
    title: 'Caterpillar: The Empire Behind the Yellow Machines',
  },
  doosan: {
    youtubeId: 'XwSqpUNcFKE',
    title: 'Doosan: When Your Rival Buys Your Future',
  },
  weichai: {
    youtubeId: 'LZ7-Vup2LVQ',
    title: 'Weichai: When Your Biggest Customer Becomes Your Rival',
  },
  kohler: {
    youtubeId: 'WMILLZgeWlM',
    title: 'Kohler: The Bathroom Giant That Sold Its Power Business',
  },
}

export function brandVideo(slug: string): BrandVideo | null {
  return Object.hasOwn(BRAND_VIDEOS, slug) ? BRAND_VIDEOS[slug] : null
}
