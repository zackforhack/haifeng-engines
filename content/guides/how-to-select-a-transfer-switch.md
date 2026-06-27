---
title: "How to Select a Transfer Switch (ATS): Types, Transitions & Sizing"
description: "A practical guide to choosing a generator transfer switch — manual vs automatic, service-entrance and bypass-isolation types, open vs closed transition, NEC load categories, NEMA enclosures and how to size the switch."
keyword: "how to select a transfer switch"
cluster: "Power & Sizing"
order: 10
updated: "2026-06-27"
hero: "/guides/hero-power-ratings.jpg"
---

A transfer switch is the device that connects your loads to whichever power source is available — utility or generator — and decides *when* to switch between them. It is one of the most critical links in any backup-power system: it monitors the sources, signals the generator to start, and moves the load safely. Choosing the right one comes down to four questions — what type, what transition, what enclosure, and what size.

**The short version:** match the switch *type* to how critical and automatic the system must be, the *transition* to how sensitive the loads are to a power gap, the *enclosure* to the install environment, and the *rating* to both the load and the generator.

## What a transfer switch actually does

The switch controller continuously watches the primary source's **voltage and frequency**. When it sees the utility drop or drift out of tolerance, it sends a **start signal** to the generator, waits for the genset to reach stable voltage and frequency, and then transfers the load. When utility power returns and stabilizes, it transfers back and signals the generator to cool down and stop. Getting that sequence right — and safe — is why switch selection matters.

## Step 1: Classify the load (NEC categories)

In North America the National Electrical Code (NEC) sorts backup systems into four categories, and the category drives the requirements:

- **Emergency systems (NEC 700)** — life-safety loads: egress lighting, fire pumps, elevators, ventilation. Strict transfer-time limits.
- **Legally required standby (NEC 701)** — loads an authority deems necessary during an outage: heating, refrigeration, smoke removal, communications.
- **Critical operations power systems (NEC 708)** — facilities whose loss would affect national security, the economy or public safety.
- **Optional standby (NEC 702)** — not legally required; commercial, agricultural and residential backup chosen by the owner.

## Step 2: Choose the switch type

- **Manual transfer switch** — a person operates it. Fine for non-critical loads; always an open-transition design.
- **Automatic transfer switch (ATS)** — electronics monitor the sources and transfer automatically, with no one present. The default for most standby systems.
- **Service-entrance rated** — incorporates the upstream utility disconnect, so responders can kill utility power at the switch. Often the most-upstream switch in a facility, and convenient for retrofits (one box instead of two).
- **Bypass-isolation** — has a second, redundant switching path so the main ATS can be serviced without dropping the load. Reserved for systems where even a momentary loss is unacceptable — hospitals, data centres.

## Step 3: Choose the transition type

How the switch moves the load between sources depends on how tolerant the loads are of a brief gap:

- **Open transition (break-before-make):** disconnects from one source before connecting the other. The load loses power for the transition time. Simple and common.
- **Open in-phase transition:** waits until both sources are in phase, then transfers quickly so motor loads don't get jolted out of phase. Used on the return to utility.
- **Open delayed (programmed) transition:** a three-position switch with a neutral "off" dwell that lets motor voltages decay before reconnecting — protects large motor loads.
- **Closed transition (make-before-break):** briefly connects both sources at once (typically ≤100 ms per UL 1008) so the load sees *no* interruption. Ideal for sensitive emergency loads; requires utility coordination.

## Step 4: Pick the enclosure

The install environment sets the NEMA enclosure type:

- **Type 1** — indoor, basic protection.
- **Type 12** — indoor, dust- and drip-resistant (industrial spaces).
- **Type 3R** — rainproof, for outdoor use with low flood risk.
- **Type 4 / 4X** — weatherproof; 4X is stainless for corrosive or coastal (salt-spray) environments.

## Step 5: Size the switch

The switch must be rated for the **load current** *and* coordinated with the **generator capacity**, so the system isn't overloaded when the genset picks up the load. Start from the same load analysis you use to size the generator — see [How to Size a Generator](/guides/how-to-size-a-generator) — and have a qualified engineer confirm the rating against code. The switch should also match your system's voltage and number of poles.

## Bringing it together

The transfer switch is part of a system that starts with the right engine and alternator. Once you've sized the load, browse [generator engines by power range](/engines/power/100-500-kwe) and work through [How to Choose a Generator Engine](/guides/how-to-choose-a-generator-engine) for the rest of the decision. For large or multi-set installations, pair this with [generator paralleling](/guides/generator-paralleling-explained).

## Frequently asked questions

### What is the difference between a manual and automatic transfer switch?
A manual switch requires a person to operate it; an automatic transfer switch (ATS) monitors the sources and transfers the load on its own, signalling the generator to start and stop. Critical and unattended systems need an ATS.

### What is the difference between open and closed transition?
Open transition (break-before-make) briefly disconnects the load during the switch, so there is a short power gap. Closed transition (make-before-break) overlaps both sources for up to ~100 ms so the load sees no interruption — better for sensitive loads, but it requires utility coordination.

### How do I size a transfer switch?
Size it to the load current it must carry and coordinate it with the generator's capacity and the system voltage. Use the same load analysis as for generator sizing, and confirm the rating and code compliance with a qualified engineer.

### Which NEMA enclosure do I need?
Type 1 for basic indoor use, Type 12 for dusty/industrial indoor spaces, Type 3R for general outdoor (rainproof), and Type 4/4X for harsh or coastal outdoor environments (4X is stainless for corrosion resistance).
