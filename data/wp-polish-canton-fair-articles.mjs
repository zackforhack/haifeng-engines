const WP_BASE = process.env.WP_BASE ?? 'https://www.haifengmachinery.com'
const WP_USER = process.env.WP_USER
const WP_APPLICATION_PASSWORD = process.env.WP_APPLICATION_PASSWORD
const WP_BASIC_AUTH = process.env.WP_BASIC_AUTH
const DRY_RUN = process.env.DRY_RUN !== '0'
const WHATSAPP_NUMBER = process.env.HAIFENG_WHATSAPP_NUMBER ?? '14163179500'
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? 'G-BT71KGQBN7'

const CONTACT_URL = `${WP_BASE}/contact-us/`

const POSTS = [
  {
    id: 20114,
    session: '137th',
    season: 'spring 2025',
    year: '2025',
    title: 'Haifeng Machinery at the 137th Canton Fair: Generator Buyer Takeaways',
    slug: 'haifeng-machinery-at-137th-canton-fair',
    image: 'https://ecdn.cnyandex.com/haifengmachinery/uploads/product-photobank-17-640-1.webp',
    imageAlt: 'Haifeng Machinery generator package discussions at the 137th Canton Fair',
    focus: 'Building long-term partnerships through power solutions',
    opening: 'In spring 2025, Haifeng Machinery met overseas generator buyers, distributors and project contractors in Guangzhou for the 137th Canton Fair. The most productive conversations were not simple product introductions. Visitors brought real site questions about standby power, prime power, gas generator systems, acoustic enclosures, engine selection, and export documentation.',
    shift: 'By the 137th session, more buyers were asking about complete project readiness: how fast a generator package can be specified, what documents are needed before shipment, and how to reduce sourcing risk when a project schedule is tight.',
    buyerQuestions: [
      'Which diesel generator package is easier to source for standby duty when the site requires documented emissions alignment?',
      'When does a natural gas or LPG generator system make more sense than a diesel set?',
      'How should a buyer compare open, silent, containerized and trailer-mounted generator configurations?',
      'What engine, alternator, controller and transfer switch information should be confirmed before quotation?',
      'How can distributors standardize a generator range without losing flexibility for local voltage, frequency and enclosure needs?',
    ],
    applicationNotes: [
      'Industrial facilities were focused on uptime, fuel availability and maintenance planning.',
      'Commercial buildings asked about acoustic control, compact footprints and automatic transfer switching.',
      'Rental and distributor buyers wanted repeatable configurations that can be quoted and serviced quickly.',
      'Remote projects asked about rugged enclosures, larger fuel tanks, spare parts and simpler service access.',
    ],
  },
  {
    id: 20309,
    session: '136th',
    season: 'autumn 2024',
    year: '2024',
    title: 'Haifeng Machinery at the 136th Canton Fair: Export-Ready Generator Packages',
    slug: 'haifeng-machinery-at-136th-canton-fair',
    image: 'https://ecdn.cnyandex.com/haifengmachinery/uploads/haifeng-natgas-generator-cover-850.webp',
    imageAlt: 'Haifeng Machinery natural gas and diesel generator package at the 136th Canton Fair',
    focus: 'Showcasing stronger export-ready generator packages',
    opening: 'In autumn 2024, Haifeng Machinery returned to the Canton Fair with a sharper message for international power equipment buyers: a generator set is not only an engine and alternator. For export projects, the practical value is in the complete package, including controls, enclosure, cooling, exhaust, documentation, packing and after-sales parts support.',
    shift: 'Many buyers arrived with specific load profiles, preferred engine brands, installation constraints or regional compliance questions. The discussion moved quickly from catalogue selection into how a generator package can be built around a real site.',
    buyerQuestions: [
      'How should buyers compare diesel and gas generator packages for fuel cost, availability and maintenance?',
      'Which configuration is best for a distributor range: open skid, silent canopy, containerized set or trailer-mounted set?',
      'What information should be collected before confirming voltage, frequency, phase and controller configuration?',
      'How can buyers reduce shipping, commissioning and spare-parts risk for overseas generator projects?',
      'What documentation helps local partners quote faster and support customers after delivery?',
    ],
    applicationNotes: [
      'Distributor conversations focused on repeatable models, spare-parts planning and technical submittals.',
      'Project contractors were interested in complete power packages that reduce coordination work on site.',
      'Industrial users asked about service access, cooling margin and control-panel clarity.',
      'Gas generator discussions were tied to fuel stability, site gas pressure and long operating hours.',
    ],
  },
  {
    id: 20312,
    session: '135th',
    season: 'spring 2024',
    year: '2024',
    title: 'Haifeng Machinery at the 135th Canton Fair: Turning Generator Questions Into Project Solutions',
    slug: 'haifeng-machinery-at-135th-canton-fair',
    image: 'https://ecdn.cnyandex.com/haifengmachinery/uploads/haifeng-natgas-generator-cover-850.webp',
    imageAlt: 'Haifeng Machinery generator project discussions at the 135th Canton Fair',
    focus: 'Turning booth discussions into project solutions',
    opening: 'At the 135th Canton Fair in spring 2024, Haifeng Machinery met buyers who wanted more than a price list. They wanted to understand how a generator package would behave in the field: whether the power rating was realistic, which fuel type was practical, how the enclosure should be selected, and what should be checked before production.',
    shift: 'The booth became a working discussion table. Buyers compared diesel and gas options, asked about control panels and transfer switching, reviewed enclosure styles, and discussed how generator packages could be adapted for different climates and project standards.',
    buyerQuestions: [
      'How do standby, prime and continuous power ratings change generator selection?',
      'What load information is needed before selecting kW or kVA capacity?',
      'Which options matter most for hot climates, dusty sites, high altitude or coastal locations?',
      'How should acoustic performance be balanced against cooling and maintenance access?',
      'When should the buyer request ATS, synchronization, remote monitoring or trailer configuration?',
    ],
    applicationNotes: [
      'Factory buyers asked about emergency backup power, automatic transfer switching and production downtime.',
      'Agricultural and remote-site buyers focused on fuel economy, service simplicity and rugged packaging.',
      'Commercial users were interested in lower noise, compact layouts and cleaner installation appearance.',
      'Project buyers wanted faster technical confirmation before committing to procurement schedules.',
    ],
  },
  {
    id: 20315,
    session: '134th',
    season: 'autumn 2023',
    year: '2023',
    title: 'Haifeng Machinery at the 134th Canton Fair: Reconnecting With Global Generator Buyers',
    slug: 'haifeng-machinery-at-the-134th-canton-fair',
    image: 'https://ecdn.cnyandex.com/haifengmachinery/uploads/haifeng-natgas-generator-cover-850.webp',
    imageAlt: 'Haifeng Machinery generator solutions at the 134th Canton Fair',
    focus: 'Reconnecting with international generator buyers',
    opening: 'The 134th Canton Fair in autumn 2023 marked an important return to face-to-face conversations for many global equipment buyers. For Haifeng Machinery, it was a chance to meet distributors, contractors, rental companies and industrial users who were comparing dependable power solutions for upcoming overseas projects.',
    shift: 'After several years of disrupted travel and supply planning, buyers wanted practical reassurance. They asked how to choose the right kW range, how to match voltage and frequency, how to control noise in commercial areas, and how to prepare generator sets for long-distance shipping.',
    buyerQuestions: [
      'What basic project information should be shared before a generator quote is accurate?',
      'How should a buyer choose between diesel standby power and a gas generator system?',
      'Which enclosure and fuel-tank choices affect installation, maintenance and delivery cost?',
      'What should distributors confirm before adding generator products to a local sales range?',
      'How can buyers prepare a cleaner inquiry to shorten technical back-and-forth?',
    ],
    applicationNotes: [
      'New buyers used the fair to understand Haifeng Machinery capabilities and export support.',
      'Returning contacts compared generator package options for local market demand.',
      'Industrial visitors wanted practical selection help, not only model names.',
      'The strongest conversations started with real site information: load, fuel, voltage, location and timeline.',
    ],
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
    'User-Agent': 'Codex Canton Fair content updater',
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

function paragraph(text) {
  return `<!-- wp:paragraph -->\n<p>${text}</p>\n<!-- /wp:paragraph -->`
}

function heading(text, id) {
  const idAttr = id ? ` id='${id}'` : ''
  return `<!-- wp:heading -->\n<h2${idAttr}>${text}</h2>\n<!-- /wp:heading -->`
}

function list(items) {
  return `<!-- wp:list -->\n<ul>\n${items.map((item) => `<li>${item}</li>`).join('\n')}\n</ul>\n<!-- /wp:list -->`
}

function ctaTrackingScript() {
  return `<script class="hf-ga4-cta-tracker">
(function(){
  if (window.__hfGa4CtaTracker) return;
  window.__hfGa4CtaTracker = true;
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
      page_slug: node.getAttribute('data-page-slug') || '',
      placement: node.getAttribute('data-placement') || '',
      intent: node.getAttribute('data-intent') || '',
      content_cluster: node.getAttribute('data-content-cluster') || ''
    };
  }
  window.hfTrackWpCta = function(eventName, params) {
    var payload = Object.assign({}, params || {});
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

function ctaSection(post) {
  const message = `Hi Haifeng Machinery, I saw your ${post.session} Canton Fair article and want to discuss a generator project. Power range: Fuel: Voltage/frequency: Destination country: Timeline:`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  const contactUrl = `${CONTACT_URL}?utm_source=organic&utm_medium=article_cta&utm_campaign=canton_fair_${post.session.replace(/\D/g, '')}`
  const attrs = [
    `data-page-slug="${htmlAttr(post.slug)}"`,
    'data-placement="canton_fair_article_cta"',
    'data-intent="project_inquiry"',
    'data-content-cluster="canton_fair_generator_buyers"',
  ].join(' ')

  return `<section class="hf-whatsapp-cta hf-canton-cta" data-hf-impression-event="wp_whatsapp_impression" ${attrs} style="border-top:2px solid #0f766e;border-bottom:1px solid #cfe1df;background:#f6fbfa;padding:20px 22px;margin:30px 0;">
  <h2 style="margin:0 0 10px;font-size:24px;line-height:1.25;color:#102a43;">Planning a generator project after Canton Fair?</h2>
  <p style="margin:0 0 16px;color:#334e68;line-height:1.6;">Send your load range, fuel type, voltage, frequency, destination country and timeline. Haifeng Machinery can help turn a fair conversation into a practical diesel or gas generator package quotation.</p>
  <p style="margin:0;">
    <a href="${htmlAttr(whatsappUrl)}" rel="nofollow noopener" target="_blank" data-hf-click-event="wp_whatsapp_click" ${attrs} style="display:inline-block;background:#0f766e;color:#fff;padding:11px 15px;text-decoration:none;font-weight:700;margin:0 8px 8px 0;">Discuss this project on WhatsApp</a>
    <a href="${htmlAttr(contactUrl)}" data-hf-click-event="wp_contact_cta_click" ${attrs} style="display:inline-block;border:1px solid #0f766e;color:#0f766e;background:#fff;padding:10px 14px;text-decoration:none;font-weight:700;margin:0 0 8px;">Request generator project support</a>
  </p>
</section>`
}

function hero(post) {
  return `<!-- wp:image {"id":0,"sizeSlug":"full","linkDestination":"none","className":"haifeng-news-hero"} -->\n<figure class="wp-block-image size-full haifeng-news-hero"><img src="${htmlAttr(post.image)}" alt="${htmlAttr(post.imageAlt)}" style="width:100%;height:auto;max-height:520px;object-fit:cover;object-position:center center;"/></figure>\n<!-- /wp:image -->`
}

function sectionHeadings(post) {
  return [
    `What Generator Buyers Asked at the ${post.session} Canton Fair`,
    'Power Package Takeaways for Overseas Projects',
    'Diesel, Gas and Hybrid Generator Conversations',
    'How Haifeng Turns Fair Discussions Into Quotations',
    `What Changed Around the ${post.session} Session`,
    'Related Haifeng Machinery Resources',
  ]
}

function hiddenToc(post) {
  const links = sectionHeadings(post)
    .map((text, index) => `<li><a style='color:#3175e4' href='#toc-${index + 1}'>${text}</a></li>`)
    .join('')
  return `<div class='table-of-contents' style='background-color:#e5e5e5;padding:10px;width:max-content'><strong>содержание</strong><ul>${links}</ul></div>`
}

function articleContent(post) {
  const headings = sectionHeadings(post)
  return `${hiddenToc(post)}<style>.table-of-contents{display:none!important;}.newsinfo_main p>img[src*="product-photobank"]{display:none!important;}</style>
${hero(post)}

${paragraph(`<strong>${post.session} Canton Fair recap:</strong> ${post.opening}`)}

${paragraph(`<strong>Exhibition focus:</strong> ${post.focus}.`)}

${paragraph(post.shift)}

${heading(headings[0], 'toc-1')}

${paragraph('The strongest booth discussions started with project context rather than a simple model request. Buyers wanted to understand how generator set selection changes when fuel, duty rating, site environment, noise limits, delivery time and documentation requirements are all considered together.')}

${list(post.buyerQuestions)}

${heading(headings[1], 'toc-2')}

${paragraph('For many overseas buyers, the generator set is only one part of the procurement decision. A practical package also needs clear engine and alternator selection, controller logic, breaker and ATS requirements, enclosure choice, cooling margin, exhaust routing, fuel system planning and packing for international shipment.')}

${list(post.applicationNotes)}

${heading(headings[2], 'toc-3')}

${paragraph('Diesel generators remained important for standby power, emergency backup, construction sites, mines, factories and areas where fuel logistics are predictable. Buyers asked about dependable starting, service access, spare parts and generator sizing for motor-starting loads.')}

${paragraph('Gas generator interest continued to grow where natural gas, CNG or LPG supply is stable. These conversations often focused on long running hours, fuel cost, emissions expectations, site gas pressure, heat management and control-system stability. For some projects, hybrid diesel-BESS or gas-BESS layouts were discussed as a way to manage transient loads and improve operating efficiency.')}

${heading(headings[3], 'toc-4')}

${paragraph('A good generator quotation starts with a clean technical brief. Haifeng Machinery encourages buyers to share the project country, application, load list, largest motor, required voltage and frequency, fuel preference, duty rating, installation environment, acoustic target, enclosure type, ATS or synchronization needs, and expected delivery schedule.')}

${paragraph('With those details, the engineering and sales team can narrow the generator package faster and reduce revisions. This is especially useful for distributors and contractors who need a repeatable quotation process for multiple tenders or regional customers.')}

${heading(headings[4], 'toc-5')}

${paragraph(`The ${post.session} Canton Fair showed that generator buyers are becoming more application-driven. Instead of asking only for a catalogue model, many visitors wanted a supplier who could explain the tradeoffs between cost, reliability, compliance, packaging and long-term service support.`)}

${paragraph('That shift matters for export projects. The best buying decision is not always the lowest initial price. It is the generator package that can be documented clearly, shipped reliably, installed with fewer surprises and supported throughout its service life.')}

${heading(headings[5], 'toc-6')}

${paragraph('For buyers comparing options after the fair, these pages can help frame the next discussion: <a href="https://www.haifengmachinery.com/product-offerings/">product offerings</a>, <a href="https://www.haifengmachinery.com/diesel-power-package-regulated/">EPA standby diesel generator packages</a>, <a href="https://www.haifengmachinery.com/gas-power-package-50hz-60hz/">CNG and LPG gas generator systems</a>, and <a href="https://www.haifengmachinery.com/news/how-to-choose-the-right-diesel-generator-for-your-industrial-project-complete-sizing-guide-2026/">diesel generator sizing guidance</a>.')}

${ctaSection(post)}

${ctaTrackingScript()}
`
}

function excerpt(post) {
  return `${post.session} Canton Fair recap from Haifeng Machinery: generator buyer questions, diesel and gas package takeaways, project quotation notes, and next steps for overseas power projects.`
}

async function patchPost(post) {
  const item = await wpJson(`/wp-json/wp/v2/news/${post.id}?context=edit&_fields=id,slug,link,title,content,excerpt`)
  const current = item.content?.raw ?? item.content?.rendered
  if (!current) throw new Error(`No content found for ${post.id}`)

  const patched = articleContent(post)
  const changed = patched !== current || item.title?.raw !== post.title

  console.log(JSON.stringify({
    id: post.id,
    slug: item.slug,
    link: item.link,
    dryRun: DRY_RUN,
    changed,
    currentLength: current.length,
    patchedLength: patched.length,
  }, null, 2))

  if (!changed || DRY_RUN) return

  const updated = await wpJson(`/wp-json/wp/v2/news/${post.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: post.title,
      content: patched,
      excerpt: excerpt(post),
    }),
  })
  console.log(`Updated ${updated.link}`)
}

async function main() {
  if (!authHeader()) throw new Error('Set WP_USER + WP_APPLICATION_PASSWORD or WP_BASIC_AUTH.')
  console.log(JSON.stringify({ dryRun: DRY_RUN, targetCount: POSTS.length, wpBase: WP_BASE }, null, 2))
  for (const post of POSTS) await patchPost(post)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
