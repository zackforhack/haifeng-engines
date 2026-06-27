---
title: "Low Voltage vs Medium Voltage Generators: When to Step Up"
description: "When large generator installations should move from low voltage to medium voltage — how higher voltage cuts current, copper and losses, the cost trade-offs of MV switchgear, and the power levels where MV makes sense."
keyword: "low voltage vs medium voltage generator"
cluster: "Power & Sizing"
order: 12
updated: "2026-06-27"
hero: "/guides/hero-na-voltage.jpg"
---

Most generator sets are **low voltage (LV)** — up to about 600 V (commonly 400/415 V on 50 Hz systems and 480 V on 60 Hz). But as installations grow into the multi-megawatt range, the current required at low voltage becomes impractical, and **medium voltage (MV)** — typically 2.4 kV to 13.8 kV — becomes the better engineering choice. Knowing where that crossover sits saves a large project from buying the wrong system.

**The short version:** for the same power, higher voltage means lower current. Above roughly 2–3 MW, or over long cable runs, the cost and bulk of low-voltage conductors push large installations toward medium voltage.

## The physics: power, voltage and current

Three-phase power follows **P = √3 × V × I**. For a fixed power, raising the voltage lowers the current proportionally. Current is what drives conductor size, busbar ratings and resistive (I²R) losses — so at large power levels, low voltage means **enormous current**, which means thick, expensive copper, paralleled cables and significant losses.

A 2 MW load at 480 V draws on the order of ~2,400 A; the same 2 MW at 4,160 V draws only ~280 A. That order-of-magnitude drop in current is the whole reason MV exists.

## Why step up to medium voltage

- **Smaller conductors:** far less copper and conduit for the same power — often the single biggest saving on large jobs.
- **Lower losses and voltage drop:** lower current means less I²R loss, which matters over distance.
- **Long distribution runs:** MV carries power across a large site or between buildings far more economically than LV.
- **Easier large-scale paralleling:** paralleling several megawatt-class sets is cleaner on an MV bus than fighting huge LV fault currents.
- **Integration with facility distribution:** many large campuses already distribute at MV, so an MV genset ties in directly.

## The trade-offs of medium voltage

MV isn't automatically better — it costs more in places LV doesn't:

- **Switchgear and breakers** are more expensive at MV.
- **Clearances and safety:** MV requires larger air gaps, more robust insulation and qualified personnel for operation and maintenance.
- **Transformation:** if most loads are low voltage, you'll need step-down transformers, adding cost and losses.
- **Smaller LV loads** can make MV overkill below the crossover.

## Where the crossover sits

There's no single hard line, but useful rules of thumb:

- **Below ~2 MW:** low voltage is usually simplest and cheapest.
- **~2–3 MW and up:** the LV conductor cost and current handling start to favour MV — evaluate both.
- **Long distances / multi-building / multi-set plants:** MV often wins earlier, because distribution and paralleling dominate the economics.
- **Existing MV distribution on site:** generate at MV to match.

The decision is ultimately a total-cost comparison: the MV switchgear premium versus the LV copper, losses and paralleling complexity it avoids.

## How it ties back to the engine and alternator

The engine choice doesn't change with voltage — a given engine drives an alternator wound for the required voltage. MV is an **alternator and switchgear** decision layered on top of engine selection. For large plants, browse [1,500+ kWe engines](/engines/power/1500-plus-kwe), review the [alternators](/alternators) that set the output voltage, and see [generator paralleling](/guides/generator-paralleling-explained) and [How to Choose a Generator Engine](/guides/how-to-choose-a-generator-engine).

## Frequently asked questions

### What counts as low voltage vs medium voltage for generators?
Low voltage generators run up to about 600 V (commonly 400/415 V at 50 Hz and 480 V at 60 Hz). Medium voltage generators typically run from 2.4 kV to about 13.8 kV (4.16 kV and 11 kV are common).

### When should I use a medium voltage generator?
Generally above roughly 2–3 MW, over long cable runs, when paralleling several large sets, or when the site already distributes power at medium voltage. Below that, low voltage is usually simpler and cheaper.

### Why does higher voltage reduce cost on large systems?
Because power equals √3 × voltage × current, higher voltage means lower current for the same power. Lower current allows much smaller conductors and lower resistive losses — saving copper, conduit and energy, which outweighs the higher switchgear cost at large scale.

### Does medium voltage change the engine I need?
No. The engine drives an alternator wound for the chosen output voltage, so medium voltage is primarily an alternator and switchgear decision. The same engine can typically serve a low- or medium-voltage genset.
