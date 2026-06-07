---
title: "How to Read an Engine Nameplate & Spec Sheet"
description: "Decode an engine nameplate (data plate) and spec sheet: engine model, serial number, rated power, displacement, EPA family, emission standard and the power ratings (prime/standby, kWe/kVA, 50/60 Hz)."
keyword: "how to read an engine nameplate"
cluster: "Choosing an Engine"
order: 4
updated: "2026-06-07"
hero: "/guides/hero-nameplate.jpg"
---

Two documents tell you everything about a generator engine: the **nameplate** bolted to the engine, and the **spec sheet** (data sheet) that comes with it. The nameplate identifies the exact unit in front of you; the spec sheet tells you what it can do. Once you can read both, buying, servicing and matching an engine gets a lot easier.

**The short version:** the **nameplate** gives the model, serial number, rated power and emission certification of *that* specific engine. The **spec sheet** gives the full performance picture — prime and standby power at 50/60 Hz, displacement, cylinders, speed and more.

## Part 1 — The nameplate (data plate)

The nameplate is the metal plate fixed to the engine block. It's the engine's identity card: you need it for ordering parts, validating warranty, and proving emissions compliance. Here's how the fields break down — the photo above is a real Perkins 404D-22 plate.

<figure>
  <img src="/guides/nameplate-anatomy.svg" alt="A labelled engine nameplate showing engine model, serial number, rated power and displacement, EPA engine family, build date, emission standard and approved fuel." />
  <figcaption>The key fields on a typical engine data plate.</figcaption>
</figure>

- **Engine model** (`404D-22`) — the manufacturer's model. Perkins's code even encodes the engine: *4* cylinders, *D* for diesel, *2.2* litres.
- **Serial number** (`GN71039R085563L`) — unique to this one engine. Quote it for spare parts and warranty.
- **Rated power** (`24.3 kW`) — the engine's rated **mechanical** output. Note this is engine kW, *not* the genset's electrical kWe (see [kVA vs kW](/guides/kva-vs-kw)).
- **Displacement** (`2.22 L`) — total swept volume of the cylinders.
- **EPA engine family** (`TPKXL02.2NLC`) — the EPA certification family that groups engines of the same emissions design.
- **Build date** (`Oct 2025`) — when it was manufactured.
- **Emission standard** — here, "conforms to 2026 U.S. EPA regulations for **stationary** compression-ignition engines," flagged for **emergency use only** (with a California-specific note). This tells you *where and how* the engine is legal to run — see [EPA emission standards](/guides/diesel-generator-epa-emission-standards).
- **Approved fuel** — "commercially available diesel fuel."

> The plate's wording matters: "stationary emergency use only" or "not for non-road mobile machinery" defines the legal application. Installing an engine outside its certified use can carry penalties.

## Part 2 — The spec sheet (data sheet)

The spec sheet is the document that describes what the engine can do. The most important section is the **power ratings**, which is also the most misread.

### Power ratings

A genset spec sheet usually lists several numbers per frequency:

| Term | Meaning |
| --- | --- |
| **kWm** | Mechanical power at the engine flywheel |
| **kWe** | Electrical power after alternator/fan losses |
| **kVA** | Apparent power (kWe ÷ 0.8 power factor) |
| **Prime (PRP)** | Unlimited-hours rating for a variable load |
| **Standby (ESP)** | Backup-only rating (~200 h/year), usually ~10% higher |
| **50 Hz / 60 Hz** | 1,500 rpm vs 1,800 rpm (for a 4-pole set) |

So "**500 kVA standby / 400 kWe prime at 50 Hz**" is four facts in one line. If you're unsure which to use, see [prime vs standby](/guides/prime-vs-standby-cop-dcp) and [kVA vs kW](/guides/kva-vs-kw).

Watch for the basis: ratings may be quoted **net (with fan)** or **gross**, which changes the number — always compare like with like.

### Engine and performance data

The rest of the sheet describes the hardware:

- **Cylinders & configuration** — e.g. inline-6 (L6) or V12.
- **Bore × stroke**, **displacement** and **compression ratio**.
- **Aspiration** — naturally aspirated, turbocharged, or turbo + intercooled.
- **Cooling** — liquid- or air-cooled (see [air vs water cooling](/guides/air-cooled-vs-water-cooled-engines)).
- **Rated speed** — the rpm, which pins the frequency (1,500 = 50 Hz, 1,800 = 60 Hz).
- **Fuel consumption** — usually litres/hour at several load points.
- **Emission standard** — e.g. U.S. EPA Tier, EU Stage V, or China stage.
- **Weight and dimensions** of the engine (or the genset).

## Putting it together

Use the **nameplate** to confirm exactly what you have (and that it's certified for your application), and the **spec sheet** to confirm it does what you need:

1. Model + serial → identify and order parts.
2. Emission line → check it's legal where you'll run it.
3. Power ratings → match prime/standby kWe & kVA to your load.
4. Speed/frequency → match your grid (50 or 60 Hz).
5. Cooling, weight, dimensions → check it fits the installation.

Every [engine page](/engines) in this catalogue lays these out the same way — power ratings, displacement, cylinders, cooling and emissions — and links the manufacturer's spec sheet where available.

## Next steps

Brush up on [kVA vs kW](/guides/kva-vs-kw) and [prime vs standby](/guides/prime-vs-standby-cop-dcp), then browse the [engine catalogue](/engines) and read a few spec pages with this guide open.
