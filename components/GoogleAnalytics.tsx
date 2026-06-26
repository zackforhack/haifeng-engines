import Script from 'next/script'

// Google Analytics 4 via gtag.js. Renders nothing unless NEXT_PUBLIC_GA_ID is set, so the site
// is safe to build/deploy before the property exists. GA4 "Enhanced Measurement" (on by default)
// tracks client-side route changes via History API events, so no manual pageview wiring is needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
