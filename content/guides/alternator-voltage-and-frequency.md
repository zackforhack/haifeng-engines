---
title: "Alternator Voltage & Frequency: 50 Hz vs 60 Hz"
description: "How generator alternators differ by frequency (50 Hz vs 60 Hz, set by poles and RPM) and by voltage output (230/400V, 480V, medium voltage, star vs delta) — and why it matters when choosing a genset."
keyword: "50hz vs 60hz alternator"
cluster: "Alternator Basics"
order: 1
updated: "2026-06-07"
hero: "/guides/hero-alternator.jpg"
---

Two genset alternators can look identical and still be incompatible — because they put out different **frequency** or **voltage**. Both are set by how the alternator is built and wired, and both must match the equipment they'll power. Here's how each one works.

**The short version:** **frequency** (50 Hz or 60 Hz) is fixed by the alternator's pole count and the engine's speed — a 4-pole set runs at 1,500 RPM for 50 Hz or 1,800 RPM for 60 Hz. **Voltage** is set by how the windings are wound and connected, and ranges from 400 V low-voltage up to several kilovolts.

## Frequency: 50 Hz vs 60 Hz

Frequency is how many times per second the AC waveform cycles. In an alternator it's a direct result of two things — the number of magnetic **poles** and the **speed** the engine turns it:

<figure>
  <img src="/guides/frequency-poles-rpm.svg" alt="Formula RPM = 120 x frequency / poles, with a table showing 2-pole, 4-pole and 6-pole speeds at 50 Hz and 60 Hz." />
  <figcaption>Output frequency is set by poles and RPM. The 4-pole machine (1,500 / 1,800 RPM) is by far the most common.</figcaption>
</figure>

So the **same engine** can produce 50 Hz or 60 Hz simply by running at a different speed — but a given genset is configured for one or the other; you can't flip a switch between them. Because 60 Hz means a higher speed (1,800 vs 1,500 RPM), an engine typically makes **about 20% more power at 60 Hz** than at 50 Hz.

**Which region uses what:**

- **50 Hz** — Europe, most of Asia, Africa, Australia, and much of South America.
- **60 Hz** — North America, parts of South America, Saudi Arabia, South Korea, the Philippines and Taiwan.

This matters because motors and equipment are frequency-specific: a 60 Hz motor runs ~17% slower (and can overheat) on 50 Hz. Always match the genset's frequency to the local grid and the connected load.

## Voltage output

Voltage is set by the alternator's windings and how they're connected. Genset alternators fall into two broad classes:

- **Low voltage (LV)** — up to ~1,000 V. This covers almost all standard gensets. Common outputs are **230/400 V** (Europe), **240/415 V** (UK, Australia), **220/380 V** (China) at 50 Hz, and **277/480 V** or **120/208 V** at 60 Hz.
- **Medium voltage (MV)** — roughly **3.3 kV, 6.6 kV, 11 kV or 13.8 kV**, used on large gensets and power plants where high current at low voltage would be impractical.

### Three-phase, star and delta

Most commercial gensets are **three-phase**. The voltage between two phases (the *line* voltage) and the voltage from a phase to neutral (the *phase* voltage) differ by a factor of √3 — which is why "400 V" three-phase also gives "230 V" single-phase from phase to neutral.

How the three windings are joined sets the available voltages:

- **Star (wye)** — provides a neutral, giving both line and phase voltages (e.g. 400 V and 230 V).
- **Delta** — provides the line voltage only.
- **Reconnectable (12-lead) alternators** can be field-wired in different star/delta, series/parallel combinations to deliver a *range* of voltages (commonly ~190–600 V) from one machine — handy for export and rental fleets.

(All ratings assume a **0.8 power factor**, as explained in [kVA vs kW](/guides/kva-vs-kw).)

## Why one model has many data sheets

Because each voltage **winding** and each frequency is a distinct configuration, a single alternator model is published as *many* technical data sheets — one per winding, pole count and frequency. That's exactly how the [alternator catalogue](/alternators) links them: pick a model and you'll find the manufacturer's data sheets covering all of its voltage and frequency options.

## Choosing the right alternator

1. **Frequency** — match your region's grid: 50 Hz or 60 Hz.
2. **Voltage** — match your distribution system (e.g. 400 V in Europe, 480 V in North America).
3. **Phase** — three-phase for commercial/industrial; single-phase only for small residential loads.
4. **kVA** — size it to the load (see the [sizing guide](/guides/how-to-size-a-generator)).

## Next steps

Browse the [alternator catalogue](/alternators) by series, pole count and kVA, brush up on [kVA vs kW](/guides/kva-vs-kw), or learn the [prime vs standby ratings](/guides/prime-vs-standby-cop-dcp) that apply to alternators too.
