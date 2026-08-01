import type { EnginePDF } from '@/lib/types'
import { getPDFUrl } from '@/lib/engines'
import { Download, ExternalLink } from 'lucide-react'

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
      <h2 className="mb-3 px-4 text-lg font-bold text-gray-900">Downloads</h2>
      <ul className="border-t border-gray-200">
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
            <a
              href={getPDFUrl(pdf.storage_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 hover:bg-blue-50"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-blue-600 text-white">
                <Download aria-hidden="true" className="h-4 w-4" />
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
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
