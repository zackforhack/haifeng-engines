---
title: "Prime vs Standby vs COP vs DCP: Generator Rating Types"
description: "The four ISO 8528 generator power ratings — ESP (standby), PRP (prime), COP (continuous) and DCP (data centre) — explained: permitted hours, load type, overload, and which rating to choose."
keyword: "prime vs standby power"
cluster: "Power & Sizing"
order: 3
updated: "2026-06-07"
hero: "/guides/hero-ratings.jpg"
---

The same engine can be sold at several different power ratings — and the one you pick depends entirely on **how the generator will be used**: as rare backup, as a site's only power source, or as a continuous base load. The international standard **ISO 8528-1** defines four ratings: **ESP, PRP, COP and DCP**. Pick the wrong one and you either overpay or overload the set.

**The short version:** **Standby (ESP)** is the highest rating, for backup only (≤ 200 hours/year). **Prime (PRP)** is for unlimited-hours running on a variable load where there's no grid. **Continuous (COP)** is the lowest rating, for steady 24/7 base load. **DCP** is a newer rating purpose-built for data centres.

## Why there are four ratings

A generator's allowable output is a trade-off against **how long and how hard it runs**. A set used a few hours a year during outages can be pushed harder than one running 8,760 hours a year. So manufacturers publish multiple ratings for the same engine: the more hours and the steadier the load, the **lower** the rating.

<figure>
  <img src="/guides/genset-ratings-comparison.svg" alt="Bar chart comparing ESP, DCP, PRP and COP genset ratings: ESP is highest power with only 200 hours/year, COP is lowest with unlimited hours." />
  <figcaption>Higher power rating = fewer permitted running hours. Values are relative to Prime (PRP = 100%).</figcaption>
</figure>

## The four ratings

### ESP — Emergency Standby Power
The maximum power available during a **utility outage**, supplying a variable load. An ESP-rated engine may run up to **200 hours per year**, with the 24-hour average load not exceeding ~70% of ESP. **No overload** is permitted. This is the rating for the vast majority of backup gensets — if the mains rarely fails, size on ESP.

### PRP — Prime Power
The maximum power for **unlimited hours** supplying a **variable** load. The permissible 24-hour average must not exceed ~70% of PRP, and a **10% overload is allowed for 1 hour in every 12**. Use Prime where the generator is the *main* power source and there is no utility — off-grid sites, mining, construction, remote facilities.

### COP — Continuous Operating Power
The maximum power for **unlimited hours** supplying a **constant** load, with **no overload**. This is the lowest of the ratings and suits true base-load duty: running 24/7 at a steady output, or operating in parallel with the grid for continuous generation.

### DCP — Data Centre Power
A newer rating (ISO 8528-1:2018) for **data centres**. A DCP-rated engine may run an **unlimited** number of hours supplying a variable or continuous load, and can back up a reliable utility. It is **not** intended for sustained utility paralleling. It sits between Prime and Standby — built for facilities that need both high availability and the ability to run for long, frequent periods.

## Side-by-side comparison

| | **ESP** Standby | **DCP** Data Centre | **PRP** Prime | **COP** Continuous |
| --- | --- | --- | --- | --- |
| Relative power | Highest (~110%) | ~105% | 100% (reference) | Lowest (~90%) |
| Max hours/year | 200 | Unlimited* | Unlimited* | Unlimited |
| Load type | Variable | Variable / continuous | Variable | Constant |
| Overload | None | None | 10% for 1 h / 12 h | None |
| Typical use | Backup power | Data-centre backup | Off-grid prime power | 24/7 base load |

<small>*Unlimited hours, but the 24-hour average load is capped (≈70% for PRP/ESP). Exact figures vary by manufacturer.</small>

## How the numbers relate

For the same engine, **Standby ≈ 1.10 × Prime**. So a genset rated **500 kVA prime** is typically around **550 kVA standby**. Continuous is lower than prime, and DCP usually sits just above prime. This is why a spec sheet often lists two (or more) figures per frequency — for example, many [Baudouin engines](/brands/baudouin) publish PRP, ESP and DCP side by side.

## Which rating should you choose?

- **Grid power present, generator is backup only** → size on **Standby (ESP)**. Most common.
- **No grid; generator is the primary source, load varies** → size on **Prime (PRP)**.
- **Steady 24/7 load, or paralleling with the grid** → size on **Continuous (COP)**.
- **Data centre / mission-critical with long, frequent runs** → use **DCP**.

A common mistake is buying a *standby*-rated set and then running it as *prime* — it will be overloaded and wear out fast. When in doubt, choose the lower (more conservative) rating.

## Next steps

Now that you know which rating applies, work out the number with the [generator sizing guide](/guides/how-to-size-a-generator), brush up on [kVA vs kW](/guides/kva-vs-kw), or browse the catalog — most [engine spec pages](/engines) list both prime and standby ratings at 50 Hz and 60 Hz.
