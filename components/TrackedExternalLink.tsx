'use client'

import type { ReactNode } from 'react'
import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null

export function TrackedExternalLink({
  href,
  eventName,
  eventProperties,
  className,
  children,
}: {
  href: string
  eventName: string
  eventProperties?: Record<string, AnalyticsValue>
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track(eventName, eventProperties)}
    >
      {children}
    </a>
  )
}
