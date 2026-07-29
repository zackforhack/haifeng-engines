---
title: "kVA vs kW vs kWe: Generator Power Ratings Explained"
description: "What kVA, kW, kWe and kWm actually mean on a generator spec sheet, how to convert between them with the 0.8 power factor, and how to read prime vs standby ratings."
keyword: "kva vs kw"
cluster: "Power & Sizing"
order: 1
updated: "2026-07-30"
hero: "/guides/hero-power-ratings.jpg"
---

Generator spec sheets throw a lot of power units at you — **kVA**, **kW**, **kWe**, **kWm** — and they are *not* interchangeable. Getting them confused is the single most common mistake when sizing a generator set. Here is what each one means and how to convert between them.

## The four numbers on a spec sheet

- **kWm (kilowatts, mechanical)** — the raw mechanical power the *engine* produces at the flywheel. This is the engine's output before it ever reaches the alternator.
- **kWe (kilowatts, electrical)** — the *real* electrical power delivered to your load, after alternator and fan losses. This is the number that does actual work: running motors, heaters, and lights.
- **kVA (kilovolt-amperes)** — the *apparent* power: the total the alternator must supply, including the reactive portion that motors and transformers draw but don't consume.
- **kW (on a genset rating)** — almost always means **kWe**, the electrical output.

## The 0.8 power factor

The bridge between kVA and kW is the **power factor (PF)**. For standby and prime generator sets the industry-standard assumption is **0.8**:

> **kW = kVA × 0.8**   and   **kVA = kW ÷ 0.8**

So a generator rated **500 kVA** delivers **400 kW** of real power at 0.8 PF. If you only know the kW figure, multiply by 1.25 to get kVA.

| If the spec sheet says… | …the other number is |
| --- | --- |
| 100 kVA | 80 kW |
| 250 kVA | 200 kW |
| 1,000 kVA | 800 kW |
| 400 kW | 500 kVA |

<figure>
  <img src="/guides/power-triangle.svg" alt="The power triangle showing real power (400 kW), reactive power (300 kVAR) and apparent power (500 kVA) with a 0.8 power factor." />
  <figcaption>The power triangle: real power (kW) and apparent power (kVA) are linked by the power factor — the cosine of the angle φ.</figcaption>
</figure>

## Why kWe is lower than kWm

The engine's mechanical output (kWm) is always a bit higher than the electrical output (kWe), because the alternator is not 100% efficient and a belt-driven fan consumes power. A typical generator efficiency is around **94%**, so:

> **kWe ≈ kWm × 0.94**

This is why a spec sheet might list an engine at, say, 441 kWm but the genset at 414 kWe — same machine, measured at two different points.

## Prime vs standby

Every rating also comes in two duty types:

- **Prime (PRP)** — unlimited running hours at a variable load. Use this for off-grid or continuous-duty sites.
- **Standby (ESP)** — emergency backup only, up to ~200 hours/year, no overload. This is the higher figure, and the one that matters for most backup gensets.

Standby is typically about **10% higher** than prime for the same engine. (We cover this in depth in the prime-vs-standby guide.)

## A worked example

Suppose you need to back up a **320 kW** building load:

1. Convert to apparent power: 320 kW ÷ 0.8 = **400 kVA** minimum.
2. Because this is backup duty, you size on the **standby** rating.
3. So you look for a genset with a **standby rating of at least 400 kVA (320 kWe)** — for example, an engine in the [300–600 kWe range](/engines?min_kwe=300&max_kwe=600) of the catalog.

## Turning kVA and kW into a generator package request

After the kVA/kW conversion is clear, the next step is not just choosing the closest engine rating. A complete generator package also needs the duty rating, voltage, frequency, phase, alternator frame, controller, enclosure, fuel type, site conditions and compliance documents to match the real project.

For standard diesel, gas or mobile power packages, review Haifeng Machinery's [generator product offerings](https://www.haifengmachinery.com/product-offerings/). For projects that include switchgear, paralleling, containerization, transformers, fuel systems or site integration, review [custom EPC power solutions](https://www.haifengmachinery.com/custom-epc-power-solutions/). If you already have a load list, send the kW/kVA target, voltage, frequency, duty type and destination market through [Contact Us](https://www.haifengmachinery.com/contact-us/) for package review.

## Quick reference

- kVA → kW: **× 0.8**
- kW → kVA: **÷ 0.8** (× 1.25)
- kWm → kWe: **× ~0.94** (alternator + fan losses)
- Standby ≈ **prime × 1.10**

Once these conversions are second nature, every spec sheet in the [engine encyclopedia](/engines) reads the same way. Next, learn [how to size a generator for your load](/guides) or browse engines by [power range](/engines).
