import type { EngineStatus } from '@/lib/types'

const config: Record<EngineStatus, { label: string; classes: string }> = {
  active: {
    label: 'In Production',
    classes: 'bg-green-100 text-green-800 border border-green-200',
  },
  discontinued: {
    label: 'Production Discontinued',
    classes: 'bg-gray-100 text-gray-600 border border-gray-300',
  },
  limited: {
    label: 'Limited / End of Life',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
}

export function StatusBadge({ status }: { status: EngineStatus }) {
  const { label, classes } = config[status]
  return (
    <span className={`inline-flex items-center border-l-4 px-2.5 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
