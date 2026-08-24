const WP_BASE = process.env.WP_BASE ?? 'https://www.haifengmachinery.com'
const WP_USER = process.env.WP_USER
const WP_APPLICATION_PASSWORD = process.env.WP_APPLICATION_PASSWORD
const WP_BASIC_AUTH = process.env.WP_BASIC_AUTH
const DRY_RUN = process.env.DRY_RUN !== '0'
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? 'G-BT71KGQBN7'
const WHATSAPP_NUMBER = process.env.HAIFENG_WHATSAPP_NUMBER ?? '14163179500'

const CONTACT_URL = `${WP_BASE}/contact-us/`

const TARGETS = [
  {
    type: 'news',
    id: 21336,
    key: 'maintenance-checklist',
    pageSlug: 'diesel-generator-maintenance-checklist-daily-weekly-monthly-annual-schedule',
    placement: 'maintenance_article_cta',
    intent: 'maintenance_support',
    contentCluster: 'diesel_generator_maintenance',
    campaign: 'wp_maintenance_checklist',
    heading: 'Need a maintenance plan for your generator fleet?',
    body: 'Send your generator model, running hours and service interval. Haifeng Machinery can help check spare parts, filters, fluids and inspection points before the next shutdown window.',
    whatsappText: 'Hi Haifeng Machinery, I need help with a diesel generator maintenance plan. Generator model: Running hours: Service interval: Site location:',
    whatsappLabel: 'Send maintenance details on WhatsApp',
    contactLabel: 'Request a maintenance quote',
  },
  {
    type: 'news',
    id: 21330,
    key: 'generator-market-forecast',
    pageSlug: '2026-industrial-generator-market-trends-growth-technology-regional-outlook',
    placement: 'market_article_cta',
    intent: 'project_planning',
    contentCluster: 'industrial_generator_market',
    campaign: 'wp_market_forecast',
    heading: 'Planning a generator project for 2026?',
    body: 'Share your power range, fuel preference, voltage, frequency and delivery region. Haifeng Machinery can map engine options, alternator choices and compliance constraints for your project.',
    whatsappText: 'Hi Haifeng Machinery, I am planning an industrial generator project. Power range: Fuel: Voltage/frequency: Destination country: Timeline:',
    whatsappLabel: 'Discuss the project on WhatsApp',
    contactLabel: 'Request project support',
  },
  {
    type: 'news',
    id: 22097,
    key: 'diesel-generator-sizing-guide',
    pageSlug: 'how-to-choose-the-right-diesel-generator-for-your-industrial-project-complete-sizing-guide-2026',
    placement: 'sizing_article_cta',
    intent: 'generator_sizing',
    contentCluster: 'diesel_generator_sizing',
    campaign: 'wp_sizing_guide',
    heading: 'Want us to check your generator sizing?',
    body: 'Send the load list, motor starting method, site altitude, ambient temperature and required standby/prime rating. We can help avoid under-sizing, over-sizing and voltage dip problems.',
    whatsappText: 'Hi Haifeng Machinery, please help check my generator sizing. Load list: Largest motor: Voltage/frequency: Altitude/ambient: Standby or prime:',
    whatsappLabel: 'Send load details on WhatsApp',
    contactLabel: 'Request sizing review',
  },
  {
    type: 'pages',
    id: 20710,
    key: 'epa-standby-diesel',
    pageSlug: 'diesel-power-package-regulated',
    placement: 'diesel_package_cta',
    intent: 'epa_standby_quote',
    contentCluster: 'epa_standby_diesel_generators',
    campaign: 'wp_diesel_power_package',
    heading: 'Need an EPA standby diesel generator package?',
    body: 'Send the kW range, voltage, frequency, destination state and enclosure requirement. Haifeng Machinery can help align the engine, alternator, controller and emissions configuration.',
    whatsappText: 'Hi Haifeng Machinery, I need an EPA standby diesel generator package. kW range: Voltage/frequency: Destination: Enclosure/sound requirement:',
    whatsappLabel: 'Send diesel package specs',
    contactLabel: 'Request EPA package quote',
  },
  {
    type: 'pages',
    id: 20726,
    key: 'gas-generator-systems',
    pageSlug: 'gas-power-package-50hz-60hz',
    placement: 'gas_package_cta',
    intent: 'gas_generator_quote',
    contentCluster: 'gas_generator_systems',
    campaign: 'wp_gas_power_package',
    heading: 'Need a CNG, LPG or natural gas generator system?',
    body: 'Share gas type, pressure, methane number or LPG composition, power range and grid mode. Haifeng Machinery can help screen engine fit, derating and control requirements.',
    whatsappText: 'Hi Haifeng Machinery, I need a gas generator system. Gas type: Gas pressure: Power range: Voltage/frequency: Grid mode:',
    whatsappLabel: 'Send gas project details',
    contactLabel: 'Request gas package quote',
  },
  {
    type: 'pages',
    id: 20587,
    key: 'product-offerings',
    pageSlug: 'product-offerings',
    placement: 'product_offerings_cta',
    intent: 'product_selection',
    contentCluster: 'generator_product_offerings',
    campaign: 'wp_product_offerings',
    heading: 'Not sure which power package fits?',
    body: 'Send your target kW, fuel, emissions need, installation type and destination market. Haifeng Machinery can narrow the options across diesel, gas, marine and replacement-engine packages.',
    whatsappText: 'Hi Haifeng Machinery, I need help choosing a power package. kW range: Fuel: Application: Destination: Emissions requirement:',
    whatsappLabel: 'Ask for product selection help',
    contactLabel: 'Request product recommendation',
  },
  {
    type: 'pages',
    id: 20236,
    key: 'contact-us',
    pageSlug: 'contact-us',
    placement: 'contact_page_whatsapp_cta',
    intent: 'direct_contact',
    contentCluster: 'contact_conversion',
    campaign: 'wp_contact_page',
    heading: 'Prefer WhatsApp for a faster response?',
    body: 'Send your model, power rating, fuel type, project country and timeline. A clear first message helps our team route the request to the right engine or generator specialist.',
    whatsappText: 'Hi Haifeng Machinery, I want to discuss a generator or engine project. Model/kW: Fuel type: Country: Timeline:',
    whatsappLabel: 'Start WhatsApp conversation',
    contactLabel: 'Send a detailed inquiry',
  },
]

function authHeader() {
  if (WP_BASIC_AUTH) return `Basic ${WP_BASIC_AUTH}`
  if (WP_USER && WP_APPLICATION_PASSWORD) {
    return `Basic ${Buffer.from(`${WP_USER}:${WP_APPLICATION_PASSWORD}`).toString('base64')}`
  }
  return null
}

async function wpJson(path, options = {}) {
  const headers = {
    'User-Agent': 'Codex WP CTA updater',
    Accept: 'application/json',
    ...(options.headers ?? {}),
  }
  const auth = authHeader()
  if (auth) headers.Authorization = auth

  const res = await fetch(`${WP_BASE}${path}`, { ...options, headers })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${res.status} ${JSON.stringify(json).slice(0, 800)}`)
  }
  return json
}

function htmlAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function gaTrackerScript(target) {
  const defaults = JSON.stringify({
    page_slug: target.pageSlug,
    placement: target.placement,
    intent: target.intent,
    content_cluster: target.contentCluster,
  }).replace(/</g, '\\u003c')

  return `<script class="hf-ga4-cta-tracker">
(function(){
  if (window.__hfGa4CtaTracker) return;
  window.__hfGa4CtaTracker = true;
  var defaults = ${defaults};
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"]')) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}';
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', '${GA4_MEASUREMENT_ID}');
  }
  function paramsFrom(node) {
    return {
      page_slug: node.getAttribute('data-page-slug') || defaults.page_slug,
      placement: node.getAttribute('data-placement') || defaults.placement,
      intent: node.getAttribute('data-intent') || defaults.intent,
      content_cluster: node.getAttribute('data-content-cluster') || defaults.content_cluster
    };
  }
  window.hfTrackWpCta = function(eventName, params) {
    var payload = Object.assign({}, defaults, params || {});
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
    if (window.gtag) window.gtag('event', eventName, payload);
  };
  document.addEventListener('click', function(event) {
    var node = event.target && event.target.closest ? event.target.closest('[data-hf-click-event],a[href*="wa.me"],a[href*="api.whatsapp.com"]') : null;
    if (!node) return;
    window.hfTrackWpCta(node.getAttribute('data-hf-click-event') || 'wp_whatsapp_click', paramsFrom(node));
  }, true);
  function observe() {
    var nodes = document.querySelectorAll('[data-hf-impression-event]');
    if (!nodes.length) return;
    function fire(node) {
      if (node.getAttribute('data-hf-impression-fired') === '1') return;
      node.setAttribute('data-hf-impression-fired', '1');
      window.hfTrackWpCta(node.getAttribute('data-hf-impression-event'), paramsFrom(node));
    }
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(fire);
      return;
    }
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        fire(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
    nodes.forEach(function(node) { observer.observe(node); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe);
  else observe();
})();
</script>`
}

function trackingAttrs(target, eventName) {
  return [
    `data-hf-click-event="${eventName}"`,
    `data-page-slug="${htmlAttr(target.pageSlug)}"`,
    `data-placement="${htmlAttr(target.placement)}"`,
    `data-intent="${htmlAttr(target.intent)}"`,
    `data-content-cluster="${htmlAttr(target.contentCluster)}"`,
  ].join(' ')
}

function sectionAttrs(target) {
  return [
    `id="hf-whatsapp-cta--${htmlAttr(target.key)}"`,
    'class="hf-whatsapp-cta"',
    'data-hf-impression-event="wp_whatsapp_impression"',
    `data-page-slug="${htmlAttr(target.pageSlug)}"`,
    `data-placement="${htmlAttr(target.placement)}"`,
    `data-intent="${htmlAttr(target.intent)}"`,
    `data-content-cluster="${htmlAttr(target.contentCluster)}"`,
    'style="border-top:2px solid #0f766e;border-bottom:1px solid #cfe1df;background:#f6fbfa;padding:20px 22px;margin:30px 0;"',
  ].join(' ')
}

function leadCta(target) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(target.whatsappText)}`
  const contactUrl = `${CONTACT_URL}?utm_source=organic&utm_medium=whatsapp_cta&utm_campaign=${encodeURIComponent(target.campaign)}`

  return `<section ${sectionAttrs(target)}>
  <h2 style="margin:0 0 10px;font-size:24px;line-height:1.25;color:#102a43;">${target.heading}</h2>
  <p style="margin:0 0 16px;color:#334e68;line-height:1.6;">${target.body}</p>
  <p style="margin:0;">
    <a href="${htmlAttr(whatsappUrl)}" rel="nofollow noopener" target="_blank" ${trackingAttrs(target, 'wp_whatsapp_click')} style="display:inline-block;background:#0f766e;color:#fff;padding:11px 15px;text-decoration:none;font-weight:700;margin:0 8px 8px 0;">${target.whatsappLabel}</a>
    <a href="${htmlAttr(contactUrl)}" ${trackingAttrs(target, 'wp_contact_cta_click')} style="display:inline-block;border:1px solid #0f766e;color:#0f766e;background:#fff;padding:10px 14px;text-decoration:none;font-weight:700;margin:0 0 8px;">${target.contactLabel}</a>
  </p>
</section>`
}

function patchContent(content, target) {
  const marker = `hf-whatsapp-cta--${target.key}`
  let next = content

  if (!next.includes(marker)) {
    next = `${next.trim()}\n\n${leadCta(target)}\n`
  }

  if (!next.includes('hf-ga4-cta-tracker')) {
    next = `${next.trim()}\n\n${gaTrackerScript(target)}\n`
  }

  return next
}

async function patchTarget(target) {
  const context = authHeader() ? 'edit' : 'view'
  const item = await wpJson(`/wp-json/wp/v2/${target.type}/${target.id}?context=${context}&_fields=id,slug,status,link,title,content`)
  const current = item.content?.raw ?? item.content?.rendered
  if (!current) throw new Error(`No content found for ${target.type}/${target.id}`)

  const patched = patchContent(current, target)
  const changed = patched !== current

  const result = {
    id: item.id,
    type: target.type,
    slug: item.slug,
    link: item.link,
    dryRun: DRY_RUN,
    changed,
    currentLength: current.length,
    patchedLength: patched.length,
  }
  console.log(JSON.stringify(result, null, 2))

  if (!changed || DRY_RUN) return result
  if (!authHeader()) throw new Error('Set WP_USER + WP_APPLICATION_PASSWORD or WP_BASIC_AUTH before running with DRY_RUN=0.')

  const updated = await wpJson(`/wp-json/wp/v2/${target.type}/${target.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: patched }),
  })
  console.log(`Updated ${updated.link}`)
  return result
}

async function main() {
  console.log(JSON.stringify({
    dryRun: DRY_RUN,
    wpBase: WP_BASE,
    ga4MeasurementId: GA4_MEASUREMENT_ID,
    hasAuth: Boolean(authHeader()),
    targetCount: TARGETS.length,
  }, null, 2))

  for (const target of TARGETS) {
    await patchTarget(target)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
