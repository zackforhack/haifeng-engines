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
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

export function PDFDownloadList({ pdfs }: { pdfs: EnginePDF[] }) {
  if (!pdfs.length) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Downloads</h2>
      <ul className="space-y-3">
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <a
              href={getPDFUrl(pdf.storage_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 rounded-lg px-4 py-3 transition-colors group"
            >
              <div className="flex-shrink-0 w-9 h-9 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-900">
                  {typeLabel[pdf.type]}
                </p>
                <p className="text-xs text-gray-500 truncate">{pdf.label}</p>
              </div>
              {pdf.file_size_bytes && (
                <span className="flex-shrink-0 text-xs text-gray-400 font-medium">
                  {formatBytes(pdf.file_size_bytes)}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
