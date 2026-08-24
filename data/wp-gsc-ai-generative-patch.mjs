const WP_BASE = process.env.WP_BASE ?? 'https://www.haifengmachinery.com'
const WP_USER = process.env.WP_USER
const WP_APPLICATION_PASSWORD = process.env.WP_APPLICATION_PASSWORD
const WP_BASIC_AUTH = process.env.WP_BASIC_AUTH
const TARGET_ID = Number(process.env.WP_NEWS_ID ?? 21324)
const DRY_RUN = process.env.DRY_RUN !== '0'

const PAGE_SLUG = 'why-is-my-diesel-generator-not-starting-15-common-causes-solutions'
const ARTICLE_URL = `${WP_BASE}/news/${PAGE_SLUG}/`
const CONTACT_URL = `${WP_BASE}/contact-us/`
const WHATSAPP_NUMBER = process.env.HAIFENG_WHATSAPP_NUMBER ?? '14163179500'

function authHeader() {
  if (WP_BASIC_AUTH) return `Basic ${WP_BASIC_AUTH}`
  if (WP_USER && WP_APPLICATION_PASSWORD) {
    return `Basic ${Buffer.from(`${WP_USER}:${WP_APPLICATION_PASSWORD}`).toString('base64')}`
  }
  return null
}

async function wpJson(path, options = {}) {
  const headers = {
    'User-Agent': 'Codex SEO updater',
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

function eventAttrs(eventName, placement, intent) {
  return [
    `data-ga-event="${eventName}"`,
    `data-page-slug="${PAGE_SLUG}"`,
    `data-placement="${placement}"`,
    `data-intent="${intent}"`,
    `onclick="window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'${eventName}',page_slug:'${PAGE_SLUG}',placement:'${placement}',intent:'${intent}',content_cluster:'diesel_generator_troubleshooting'});if(window.gtag){window.gtag('event','${eventName}',{page_slug:'${PAGE_SLUG}',placement:'${placement}',intent:'${intent}',content_cluster:'diesel_generator_troubleshooting'});}"`,
  ].join(' ')
}

function leadCta() {
  const message = [
    'Hi Haifeng Machinery, I need help with a diesel generator no-start issue.',
    'Fault code/controller:',
    'Does it crank?',
    'Battery voltage:',
    'Fuel level/filter status:',
  ].join('\n')
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  return `<section class="hf-ai-lead-cta" style="border:1px solid #c7d7ea;background:#f7fbff;padding:18px 20px;margin:24px 0;">
  <h2 style="margin:0 0 10px;">Need help with a generator no-start fault?</h2>
  <p style="margin:0 0 14px;">Send the controller alarm, battery voltage and whether the engine cranks. Haifeng Machinery can help narrow the issue to battery, fuel, starter, controller or shutdown protection before major parts are replaced.</p>
  <p style="margin:0;">
    <a href="${whatsappUrl}" rel="nofollow noopener" target="_blank" ${eventAttrs('wp_whatsapp_click', 'ai_answer_block', 'troubleshooting')} style="display:inline-block;background:#0f766e;color:#fff;padding:10px 14px;text-decoration:none;font-weight:700;margin:0 8px 8px 0;">Send fault details on WhatsApp</a>
    <a href="${CONTACT_URL}?utm_source=organic&utm_medium=ai_answer&utm_campaign=diesel_no_start" ${eventAttrs('wp_contact_cta_click', 'ai_answer_block', 'troubleshooting')} style="display:inline-block;border:1px solid #0f766e;color:#0f766e;padding:9px 13px;text-decoration:none;font-weight:700;margin:0 0 8px;">Request engineering support</a>
  </p>
</section>`
}

function faqSection() {
  return `<section class="hf-ai-faq" style="margin:28px 0;">
  <h2>Diesel Generator No-Start FAQ</h2>
  <h3>What does crank attempt 1 mean on a generator?</h3>
  <p>Crank attempt 1 usually means the controller has started its first programmed start cycle. If the engine does not reach running speed before the cycle timeout, the controller will pause and try again or report an overcrank/no-start alarm.</p>
  <h3>What does DG blocked for start mean?</h3>
  <p>DG blocked for start means the generator controller is preventing a start command because a protection input, emergency stop, remote inhibit, alarm, low coolant, low oil pressure signal, breaker condition or configuration interlock must be cleared first.</p>
  <h3>What should I check if a diesel generator cranks but will not start?</h3>
  <p>If it cranks but will not start, check fuel level, fuel shutoff valve position, air in fuel lines, clogged filters, injection pump delivery, controller alarms, emergency stop state and whether the engine has enough compression for ignition.</p>
  <h3>What should I check if the generator does not crank?</h3>
  <p>If it does not crank, start with battery voltage, charger output, battery terminals, control fuses, start relay, starter solenoid and the emergency stop circuit before replacing the starter motor.</p>
</section>`
}

function schemaJson() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${ARTICLE_URL}#article`,
        headline: 'Diesel Generator Not Starting? Crank, Fuel & Alarm Checks',
        description: 'Diesel generator not starting or blocked for start? Use this quick checklist for crank attempts, battery, fuel, starter, shutdown alarms, oil pressure, coolant and controller faults.',
        url: ARTICLE_URL,
        mainEntityOfPage: { '@type': 'WebPage', '@id': ARTICLE_URL },
        author: { '@type': 'Organization', name: 'Haifeng Machinery', url: WP_BASE },
        publisher: { '@type': 'Organization', name: 'Haifeng Machinery', url: WP_BASE },
        datePublished: '2026-06-17',
        dateModified: new Date().toISOString().slice(0, 10),
        about: ['Diesel generator', 'Generator controller', 'Starter motor', 'Fuel filter', 'Battery voltage', 'Shutdown alarm'],
      },
      {
        '@type': 'FAQPage',
        '@id': `${ARTICLE_URL}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What does crank attempt 1 mean on a generator?',
            acceptedAnswer: { '@type': 'Answer', text: 'Crank attempt 1 usually means the controller has started its first programmed start cycle. If the engine does not reach running speed before the cycle timeout, the controller will pause and try again or report an overcrank/no-start alarm.' },
          },
          {
            '@type': 'Question',
            name: 'What does DG blocked for start mean?',
            acceptedAnswer: { '@type': 'Answer', text: 'DG blocked for start means the generator controller is preventing a start command because a protection input, emergency stop, remote inhibit, alarm, low coolant, low oil pressure signal, breaker condition or configuration interlock must be cleared first.' },
          },
          {
            '@type': 'Question',
            name: 'What should I check if a diesel generator cranks but will not start?',
            acceptedAnswer: { '@type': 'Answer', text: 'If it cranks but will not start, check fuel level, fuel shutoff valve position, air in fuel lines, clogged filters, injection pump delivery, controller alarms, emergency stop state and whether the engine has enough compression for ignition.' },
          },
          {
            '@type': 'Question',
            name: 'What should I check if the generator does not crank?',
            acceptedAnswer: { '@type': 'Answer', text: 'If it does not crank, start with battery voltage, charger output, battery terminals, control fuses, start relay, starter solenoid and the emergency stop circuit before replacing the starter motor.' },
          },
        ],
      },
    ],
  }
}

function patchContent(content) {
  let next = content
    .replaceAll('https://www.haifengmachinery.com/contact"', 'https://www.haifengmachinery.com/contact-us/"')
    .replaceAll(`${WP_BASE}/contact"`, `${CONTACT_URL}"`)

  if (!next.includes('hf-ai-lead-cta')) {
    const anchor = '</section>\r\n\t\t\t\t<img loading="lazy" decoding="async" src="https://ecdn.cnyandex.com/haifengmachinery/uploads/微信图片_20260617164858_93_2.jpg"'
    next = next.includes(anchor)
      ? next.replace(anchor, `</section>\n${leadCta()}\n\t\t\t\t<img loading="lazy" decoding="async" src="https://ecdn.cnyandex.com/haifengmachinery/uploads/微信图片_20260617164858_93_2.jpg"`)
      : next.replace('</section>', `</section>\n${leadCta()}`)
  }

  if (!next.includes('hf-ai-faq')) {
    next = next.replace('<h2 id=\'toc-7\'><strong><b>Prevention: Avoid No-Start Failures</b></strong></h2>', `${faqSection()}\n<h2 id='toc-7'><strong><b>Prevention: Avoid No-Start Failures</b></strong></h2>`)
  }

  if (!next.includes('hf-ai-schema')) {
    const schema = `<script type="application/ld+json" class="hf-ai-schema">${JSON.stringify(schemaJson()).replace(/</g, '\\u003c')}</script>`
    next += `\n${schema}\n`
  }

  return next
}

async function main() {
  const context = authHeader() ? 'edit' : 'view'
  const post = await wpJson(`/wp-json/wp/v2/news/${TARGET_ID}?context=${context}&_fields=id,slug,status,link,title,content`)
  const current = post.content?.raw ?? post.content?.rendered
  if (!current) throw new Error(`No content found for news ${TARGET_ID}`)

  const patched = patchContent(current)
  const changed = patched !== current

  console.log(JSON.stringify({
    id: post.id,
    slug: post.slug,
    link: post.link,
    dryRun: DRY_RUN,
    changed,
    hasAuth: Boolean(authHeader()),
    currentLength: current.length,
    patchedLength: patched.length,
  }, null, 2))

  if (!changed || DRY_RUN) return
  if (!authHeader()) throw new Error('Set WP_USER + WP_APPLICATION_PASSWORD or WP_BASIC_AUTH before running with DRY_RUN=0.')

  const updated = await wpJson(`/wp-json/wp/v2/news/${TARGET_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: patched }),
  })
  console.log(`Updated ${updated.link}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
