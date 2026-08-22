'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null
type AnalyticsEventName = string | readonly string[]
type GoogleAnalyticsValue = string | number | boolean

function googleAnalyticsProperties(properties?: Record<string, AnalyticsValue>) {
  if (!properties) return undefined
  return Object.fromEntries(
    Object.entries(properties).filter((entry): entry is [string, GoogleAnalyticsValue] => entry[1] !== null),
  )
}

function trackEvents(eventName: AnalyticsEventName, properties?: Record<string, AnalyticsValue>) {
  const names = Array.isArray(eventName) ? eventName : [eventName]
  const gaProperties = googleAnalyticsProperties(properties)
  const gtag = typeof window !== 'undefined'
    ? (window as typeof window & {
        gtag?: (command: 'event', eventName: string, params?: Record<string, GoogleAnalyticsValue>) => void
      }).gtag
    : undefined

  for (const name of names) {
    track(name, properties)
    gtag?.('event', name, gaProperties)
  }
}

export function TrackedExternalLink({
  href,
  eventName,
  eventProperties,
  impressionEventName,
  impressionEventProperties,
  className,
  children,
}: {
  href: string
  eventName: AnalyticsEventName
  eventProperties?: Record<string, AnalyticsValue>
  impressionEventName?: AnalyticsEventName
  impressionEventProperties?: Record<string, AnalyticsValue>
  className?: string
  children: ReactNode
}) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const trackedImpression = useRef(false)

  useEffect(() => {
    if (!impressionEventName || trackedImpression.current) return
    const node = linkRef.current
    if (!node) return

    const trackImpression = () => {
      if (trackedImpression.current) return
      trackedImpression.current = true
      trackEvents(impressionEventName, impressionEventProperties ?? eventProperties)
    }

    if (!('IntersectionObserver' in window)) {
      trackImpression()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        trackImpression()
        observer.disconnect()
      },
      { threshold: 0.5 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [eventProperties, impressionEventName, impressionEventProperties])

  return (
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvents(eventName, eventProperties)}
    >
      {children}
    </a>
  )
}
