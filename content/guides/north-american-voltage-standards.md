---
title: "North American Voltage Standards: 120V / 208V / 277V / 480V"
description: "Understand North American three-phase voltage systems: the V(L-L) = √3 × V(L-N) formula, the 120/208V and 277/480V Wye systems, the 208V high-leg-delta trap, and how to match a generator to the facility."
keyword: "208v vs 480v"
cluster: "Alternator Basics"
order: 2
updated: "2026-06-07"
hero: "/guides/hero-na-voltage.jpg"
---

Spec a generator for North America and you'll meet a wall of voltages — **120, 208, 277, 480**. They aren't random: they come from a single relationship in three-phase power. Get them straight and equipment selection becomes simple; get them wrong and you risk damaged gear or a genset that won't serve the load.

**The short version:** North America runs two main three-phase systems — **120/208V** (commercial) and **277/480V** (industrial) — both wired in a "Wye". In each, the line-to-line voltage is **√3 (≈1.732)** times the line-to-neutral voltage.

## The formula behind everything

Every North American three-phase voltage pair comes from one equation:

> **V(L-L) = √3 × V(L-N)**

…where **V(L-L)** is the voltage between any two phases (line-to-line) and **V(L-N)** is the voltage from a phase to neutral (line-to-neutral). The √3 factor comes from the 120° phase shift between the three phases.

<figure>
  <img src="/guides/na-wye-voltages.svg" alt="A three-phase wye diagram with the formula V(L-L) = √3 × V(L-N), showing the 120/208V and 277/480V systems." />
  <figcaption>Both common systems are Wye-connected: line-to-line voltage is √3 times the line-to-neutral voltage.</figcaption>
</figure>

That's why **120 × 1.732 ≈ 208 V** and **277 × 1.732 ≈ 480 V**.

## System 1: 120/208V — the commercial standard

A three-phase, four-wire **Wye** (plus ground):

- **Line-to-neutral:** 120 V
- **Line-to-line:** 208 V
- **Where:** offices, retail, light industry, multi-tenant residential, small data centres.

**Why 208 V and not 240 V?** Unlike Europe's 230/400V system, the North American Wye is built from three transformer windings each supplying 120 V. Measure between any two phases and the vectors add to **208 V** — not the 240 V you get from a residential split-phase service.

<figure>
  <img src="/guides/v-120-240-split-phase.png" alt="Split-phase 120/240V: Line 1 and Line 2 each measure 120 V to the neutral, and 240 V between the two lines." />
  <figcaption>Single-phase split-phase (residential): two 120 V legs sum to 240 V line-to-line — not the same as a 208 V Wye.</figcaption>
</figure>

One distribution system then serves both:

- **120 V single-phase** loads — outlets, lighting, computers, small appliances.
- **208 V three-phase** loads — HVAC, kitchen equipment, elevators, IT infrastructure.

<figure>
  <img src="/guides/v-120-208-wye.png" alt="120/208V Wye three-phase supply: each line is 120 V to neutral and 208 V between any two lines." />
  <figcaption>120/208V Wye: 120 V line-to-neutral, 208 V line-to-line — the commercial standard.</figcaption>
</figure>

## System 2: 277/480V — the industrial workhorse

Also a three-phase, four-wire **Wye**:

- **Line-to-neutral:** 277 V
- **Line-to-line:** 480 V
- **Where:** large commercial buildings, hospitals, campuses, factories, data centres.

**Why 277 V matters:** large facilities use 480/277V as the main supply. The 277 V line-to-neutral feeds commercial lighting (fluorescent and LED) directly, avoiding a separate step-down to 120 V for every lighting circuit — a real saving at scale.

**Why 480 V wins for power:** because power = √3 × V × I × pf, a higher voltage carries the same power at a **lower current**. At 480 V the current is **less than half** that of a 208 V system for the same kW — meaning smaller conductors, lower voltage drop over distance, and cheaper cable runs. This is why diesel gensets, UPS systems and transfer switches for industrial sites are commonly 480 V.

<figure>
  <img src="/guides/v-277-480-wye.png" alt="277/480V Wye supply: 277 V from each line to neutral and 480 V between any two lines." />
  <figcaption>277/480V Wye: 277 V line-to-neutral feeds lighting, 480 V line-to-line powers the building.</figcaption>
</figure>

## 347/600V — the Canadian standard

In Canada, large facilities often run **347/600V** instead of 277/480V — the same Wye arrangement, scaled up. The line-to-neutral voltage is **347 V** (347 × 1.732 ≈ 600) and feeds 347 V lighting, while **600 V** line-to-line moves power even more efficiently than 480 V. If you're specifying a genset for a Canadian industrial site, expect 600 V.

<figure>
  <img src="/guides/v-347-600-wye.png" alt="347/600V Wye supply: 347 V from each line to neutral and 600 V between any two lines." />
  <figcaption>347/600V Wye: Canada's industrial equivalent of 277/480 V.</figcaption>
</figure>

## The 208V trap: two sources, one number

A common and dangerous mix-up: **not every 208 V is the same.**

- **From a 120/208V Wye:** 208 V is the line-to-line voltage, balanced, with a proper neutral. The modern standard.
- **From a high-leg delta (older systems):** a 240 V delta with a center-tapped transformer produces a "high leg" that reads **~208 V to neutral** on one phase (the "B" phase) — and that leg **must not** feed 120 V loads.

> A meter reading of "208 V" tells you nothing on its own. Connect 120 V equipment to a high-leg delta and you can destroy it.

<figure>
  <img src="/guides/v-240-high-leg-delta.png" alt="240V high-leg (open) delta: Phase B is the wild leg reading 208 V to neutral, the phases are 240 V apart, and Phases A and C give 120 V to neutral." />
  <figcaption>High-leg (wild-leg) delta: the "B" phase reads ~208 V to neutral and must never feed 120 V loads.</figcaption>
</figure>

## Reading the nameplate

The nameplate hints at the system the equipment expects:

| Nameplate | System |
| --- | --- |
| 208/120 V | 120/208V Wye (four-wire) |
| 277/480 V | 277/480V Wye (four-wire) |
| 347/600 V | 347/600V Wye (four-wire, Canada) |
| 480 V only | Likely three-wire, no neutral |
| 120/240 V | Split-phase, or high-leg delta |

Before connecting, confirm: **Is a neutral available? Three-wire or four-wire? Does the load draw line-to-line or line-to-neutral? Are the protective devices rated for the voltage?**

## Matching the generator

The genset's alternator must be configured for the site's voltage — 208 V or 480 V — and the automatic transfer switch and switchgear must match it. **Reconnectable (12-lead) alternators** make this easier: one machine can be field-wired across roughly 190–600 V, which is ideal for export and rental fleets serving different sites.

Equipment built for other regions adds a step. A genset wound for **380 V** (the common Asian standard) can't be dropped straight onto a 480 V or 208 V system — overvoltage breaks down insulation, undervoltage causes hard starting and lost efficiency — so a voltage-conversion transformer or a reconnected/rewound alternator is required. North America is also **60 Hz** (see [50 Hz vs 60 Hz](/guides/alternator-voltage-and-frequency)), which must match too.

## Quick reference

- **V(L-L) = √3 × V(L-N)** — the master relationship.
- **120/208V Wye** → commercial; serves 120 V single-phase + 208 V three-phase.
- **277/480V Wye** → industrial; 277 V lighting, 480 V power at lower current.
- **Always confirm the system type**, not just the meter reading.

## Next steps

Pair this with the [alternator voltage & frequency](/guides/alternator-voltage-and-frequency) basics, [size the genset](/guides/how-to-size-a-generator), then browse the [alternator catalogue](/alternators).

<small>Reference standards: NFPA 70 (NEC), IEC 60038, ANSI/NEMA. For information only — not a substitute for professional electrical engineering advice.</small>
