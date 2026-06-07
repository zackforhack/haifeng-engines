---
title: "How to Size a Generator: A Step-by-Step Guide"
description: "How to size a generator for your load: add up running watts, account for the largest motor's starting surge, apply power factor and a spare-capacity margin. Includes an interactive sizing calculator."
keyword: "how to size a generator"
cluster: "Power & Sizing"
order: 2
updated: "2026-06-07"
hero: "/guides/hero-sizing.jpg"
---

Undersize a generator and it will stall, overheat, or fail to start your motors; oversize it and you waste money and run it inefficiently (which causes "wet stacking" in diesels). The right size covers your **running load plus the surge** when your biggest motor starts — with a sensible margin on top.

**The short version:** add up the running watts of everything that runs at once, add the extra surge of the single largest motor at startup, divide by the power factor to get kVA, then add ~25% spare capacity. The interactive calculator below does this for you.

<!--CALCULATOR-->

## Step 1 — Total your running load

List every appliance, motor, light and device that will run **at the same time** and add up their **running** (rated) watts. Nameplate ratings are on the equipment; for a whole building, a rough estimate is about **5 watts per square foot plus 50 kW** for general commercial use.

This running total is the power the generator must supply continuously.

## Step 2 — Add the largest motor's starting surge

Motors are the reason sizing isn't just simple addition. When an electric motor starts, it briefly draws far more than its running power — the **inrush current**. You don't add the surge of *every* motor (they rarely start at the same instant), but you must cover your **single largest motor starting while everything else is already running**.

The surge depends on how the motor is started:

| Start method | Startup draw | Typical use |
| --- | --- | --- |
| Direct-on-line (DOL) | ~3× running | Most small/medium motors |
| Soft starter | ~2× running | Pumps, conveyors |
| Variable frequency drive (VFD) | ~1.5× running | Modern HVAC, controlled motors |

So a 45 kW DOL motor adds about `45 × (3 − 1) = 90 kW` of *extra* startup demand on top of its running power.

> **Peak demand = total running load + (largest motor running × (start factor − 1))**

<figure>
  <img src="/guides/generator-sizing-breakdown.svg" alt="Bar chart: a 200 kW running load plus a 90 kW starting surge from the largest motor equals a 290 kW peak demand." />
  <figcaption>The generator must cover the running load plus the brief surge when the largest motor starts.</figcaption>
</figure>

## Step 3 — Convert kW to kVA with power factor

Generators are rated in both kW (real power) and kVA (apparent power). Convert with the standard **0.8 power factor**:

> **kVA = kW ÷ 0.8**

(For a deeper explanation, see [kVA vs kW vs kWe explained](/guides/kva-vs-kw).)

## Step 4 — Add a spare-capacity margin

Never size a generator to run flat-out. Industry practice is to leave headroom — typically **25%** — so the set normally runs at **70–80% load**. This protects against voltage dips (keep them under 15%), absorbs small future additions, and keeps the engine in its efficient, healthy operating band.

> **Recommended rating = the larger of:** peak startup demand, **or** running load × 1.25

## Worked example

A small factory:

- Running load (lights, controls, small machines): **200 kW**
- Largest motor: a **45 kW** compressor, started direct-on-line (×3)

1. Starting surge of the compressor: 45 × (3 − 1) = **90 kW**
2. Peak demand at startup: 200 + 90 = **290 kW**
3. Continuous with 25% margin: 200 × 1.25 = **250 kW**
4. Required rating = max(290, 250) = **290 kW** → ÷ 0.8 = **≈ 363 kVA**

You'd then look for a genset with a **prime rating of at least 290 kWe / 363 kVA** — browse the [300–600 kWe range](/engines?min_kwe=300&max_kwe=600) to find matching engines.

## Common mistakes to avoid

- **Forgetting motor surge** — the most frequent cause of undersizing. A generator that's fine on running watts can still fail to start a single large motor.
- **Adding every motor's surge** — too conservative; only the largest matters.
- **Sizing to 100% load** — leaves no headroom and shortens engine life.
- **Confusing kW and kVA** — always check which unit the spec sheet uses.

## Next steps

Once you know your target rating, the rest is matching it to real hardware. Browse the catalog by [power range](/engines), compare [prime vs standby ratings](/guides), or filter [diesel and gas engines](/engines) by brand. When in doubt on a critical installation, have a qualified engineer confirm the load study.
