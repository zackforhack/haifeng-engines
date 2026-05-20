import type { EnginePDF } from '@/lib/types'
import { getPDFUrl } from '@/lib/engines'

const typeLabel: Record<EnginePDF['type'], string> = {
  datasheet: 'Datasheet',
  manual: 'Service Manual',
  brochure: 'Brochure',
  other: 'Document',
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return mb >= 1 ? ` (${mb.toFixed(1)} MB)` : ` (${(bytes / 1024).toFixed(0)} KB)`
}

export function PDFDownloadList({ pdfs }: { pdfs: EnginePDF[] }) {
  if (!pdfs.length) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Downloads</h2>
      <ul className="space-y-2">
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <a
              href={getPDFUrl(pdf.storage_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12V8l-4-4H4v14zm8-13l3 3h-3V5zM3 2h10l5 5v13H3V2z" />
              </svg>
              <span>
                {typeLabel[pdf.type]}: {pdf.label}
                <span className="text-gray-400">{formatBytes(pdf.file_size_bytes)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
