import type { BrandVideo as BrandVideoData } from '@/lib/brand-videos'

export function BrandVideo({ brand, video }: { brand: string; video: BrandVideoData }) {
  return (
    <section aria-labelledby="brand-video-heading" className="mb-10 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid lg:grid-cols-3">
        <div className="aspect-video bg-gray-950 lg:col-span-2">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
            title={video.title}
            width="800"
            height="450"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="flex flex-col justify-center p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">{brand} brand story</p>
          <h2 id="brand-video-heading" className="mb-3 text-lg font-semibold text-gray-900">{video.title}</h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Watch Haifeng Machinery’s video about {brand}, then explore engine specifications and selection resources below.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start rounded text-sm font-semibold text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Watch on YouTube ↗
          </a>
        </div>
      </div>
    </section>
  )
}
