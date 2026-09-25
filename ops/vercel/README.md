# Catalog rate limit rollout

Status: local preparation only. No Vercel rule has been saved or activated.

`catalog-rate-limit.json` is a dashboard rule template, not a complete firewall
configuration or a `vercel.json` fragment. It follows Vercel's official
[rate-limit template](https://github.com/vercel/firewall-templates/blob/main/api-rate-limit/rule.json).

The draft counts GET and HEAD requests to exactly `/engines` and `/alternators`
(including trailing slashes) together per IP, with a 60-second fixed window and
an initial threshold of 120 requests. The follow-up action is **Log**, so even
requests above the threshold remain allowed. Query strings and changing user
agents do not give the same IP another counter. Detail pages, series pages,
assets, PDFs, robots.txt, and sitemaps are outside the rule's scope.

120 is a starting hypothesis, not a measured safe threshold. Next.js prefetches,
redirects, legitimate crawlers, and users sharing a NAT can add to the counter.
There is deliberately no user-agent-based bypass, country block, or persistent
IP ban.

## Prepare the dashboard form

Run `node scripts/catalog-firewall-link.mjs YOUR_TEAM_SLUG haifeng-engines`.
The command only prints a link containing the local template; it performs no
network request. Opening it prepares the dashboard form. Check for an existing
catalog rule and edit it instead of creating a duplicate. Review other rules
and available plan capacity before saving. Publish only when production changes
are authorized; saving this file or deploying the app does not activate it.

## Measure, enforce, and roll back

1. Publish the Log rule when authorized. Observe at least a representative
   business day, including known crawler activity. Review per-IP request rates,
   matched paths, verified crawler classifications, and normal catalog journeys.
2. Set the threshold above observed legitimate bursts with headroom for shared
   networks and prefetching. Validate trusted crawler treatment through Vercel's
   verified bot information; do not trust self-declared user-agent names.
3. When blocking is authorized, change the existing rate-limit follow-up action
   from Log to **Default (429)** in the dashboard and publish. Keep the same
   scope and counter. Check 429 volume, catalog success rate, and database errors.
4. If legitimate traffic is affected, return the follow-up action to Log (or
   disable this rule) and publish. No application rollback is required.

Local tests validate the template's matching scope and application behavior.
They cannot validate Vercel's actual counters or 429 responses; those checks
must follow activation. Counters are per Vercel region. Inspect any applicable
WAF usage costs and existing plan limits during the dashboard review.

References: [rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting),
[custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules).
