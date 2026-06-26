import Script from 'next/script'

// Google Analytics 4 via gtag.js. Measurement IDs are not secret (visible in page source), so the
// live ID is the default and NEXT_PUBLIC_GA_ID overrides it (e.g. a separate staging property).
// GA4 "Enhanced Measurement" (on by default) tracks client-side route changes via History API
// events, so no manual pageview wiring is needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-BT71KGQBN7'

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
