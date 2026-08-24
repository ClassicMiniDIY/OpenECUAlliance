# OpenECU Alliance — social/community launch posts

Written 2026-08-24. Facts as of this date: 9 log adapters, 9 CAN broadcast
protocols, 466 canonical channel IDs across 20 categories, ~547 vendor channel
mappings. Update the numbers before posting if the specs directory has grown.

Primary link: https://oecua.org

---

## 1. Reddit — r/ECU_Tuning, r/Autotuning, r/Speeduino, r/CarHacking

**Title:** Every ECU logs in its own format. I built an open spec so tools stop
reinventing the parser.

Body:

If you have ever tried to open a Haltech CSV, a Speeduino MLG, an AiM XRK and a
Link LLG in the same piece of software, you know the problem. Nine ECUs, nine
file formats, nine sets of channel names for the same sensor. Your MAP sensor is
`MAP`, `Manifold Pressure`, `MAP_kPa`, or column 14, depending on who wrote the
firmware. Every dash project, every log viewer, every "I'll just script this in
Python" ends up reimplementing the same format handling from scratch, badly.

So we started the OpenECU Alliance and published the OpenECU Spec.

It is a plain YAML file that describes an ECU log format or a CAN broadcast, and
maps the vendor's names onto a shared vocabulary. 466 canonical channel IDs
across 20 categories. Units stay truthful to what the file actually contains,
and when the vendor logs psi and the canonical unit is kPa, the adapter declares
a scale/offset so your code can convert without guessing.

No SDK. No runtime. No library to link against. It is data. Read it in Rust,
Python, C, whatever you write in.

Right now the catalog covers:

- Log adapters: Haltech, Link, AiM, rusEFI, Speeduino, MegaSquirt/TunerStudio,
  ECUMaster, RomRaider (Subaru), Emerald
- CAN broadcast protocols: Haltech Elite, AEM Infinity, Emtron, MaxxECU,
  Syvecs S7, ECUMaster EMU, MegaSquirt, rusEFI, Speeduino

The CAN side is the part I did not expect to matter as much as it does. If you
have ever built a digital dash off a manufacturer PDF, you have hand-copied
bit offsets, byte order and scaling factors and then spent an evening working out
why coolant temp reads 4000 degrees. Those are now machine-readable files with a
validator that checks for overlapping signals, out-of-range CAN IDs, and signals
that overflow their frame. That validator found two real bugs in our own files on
its first run.

Browse it: https://oecua.org
There is a JSON API and raw YAML downloads on every page, so you can pull it
straight into your project.

It is open, it is free, and the point is that nobody should write the Haltech CSV
parser a tenth time. If your ECU is missing, the contribution is one YAML file
and a pull request. MoTeC, AEM, Holley and FuelTech log formats are the obvious
gaps.

---

## 2. Hacker News — Show HN

**Title:** Show HN: An open spec for ECU log formats and CAN broadcasts

Body:

Aftermarket engine ECUs (Haltech, Link, MoTeC, MegaSquirt, rusEFI, and a few
dozen others) each log data in their own format, with their own channel names,
in their own units. Same for their CAN broadcast frames. The result is that
every tool touching this data — log viewers, dashes, analysis scripts, data
loggers — writes its own parser per vendor, and the channel-name normalization
is usually a hardcoded dictionary somewhere in the codebase that nobody wants to
own.

I hit this building an open-source log viewer, realized format handling was
turning into the entire project, and split it out.

The OpenECU Spec is a YAML description of a log format or a CAN protocol:
structure, delimiters, byte offsets, bit layouts, endianness, and a mapping from
the vendor's channel names to a shared registry of 466 canonical IDs. Unit
conversions are declared as scale/offset in the file rather than being folded
into someone's parser. It is language-agnostic on purpose — there is no
reference implementation you have to adopt, just data you can read.

Two design decisions worth calling out:

1. An adapter's `unit` field describes what the log file actually contains, not
   what we wish it contained. If the vendor writes psi, the adapter says psi and
   carries the conversion. A spec that lies about the file it describes is worse
   than no spec.
2. Where a vendor's own documentation contradicts itself, the signal carries a
   `disputed` field with the reason instead of us silently picking a side. It
   downgrades a validator error to a warning and leaves a record. Currently used
   exactly once.

Catalog, JSON API and raw file downloads: https://oecua.org

Currently 9 log adapters and 9 CAN protocols. Contributions are one file and a
PR, and there is a validator that gates the deploy.

---

## 3. Discord / Slack — short blast (Speeduino, rusEFI, ECUMaster, tuning servers)

Short version, drop in #general or #development:

If you write anything that reads ECU logs or CAN frames, this might save you a
weekend.

https://oecua.org — an open spec that describes ECU log formats and CAN
broadcast protocols as plain YAML, and maps every vendor's channel names onto
one shared vocabulary of 466 canonical IDs. Haltech, Link, AiM, rusEFI,
Speeduino, MegaSquirt, ECUMaster, RomRaider and Emerald so far, plus CAN
broadcast definitions for AEM Infinity, Emtron, MaxxECU and Syvecs.

No library, no SDK, no runtime. It is data. There is a JSON API and raw YAML
downloads if you want it in your build.

Free, open, and looking for adapters. If you know your ECU's log format well
enough to argue about it, you know it well enough to contribute one.

---

## 4. Forum long-form — msextra, Speeduino forum, rusEFI, HybridZ, NASIOC

**Subject:** OpenECU Spec — an open, machine-readable description of ECU log
formats and CAN broadcasts

Post:

Long-time problem, short introduction.

Every aftermarket ECU logs in its own format. That is fine and expected — the
formats grew out of each firmware and they do what they need to do. What is not
fine is what it does to everyone downstream. If you are writing a log analyzer,
a digital dash, a data logger, or just a Python script to plot AFR against
throttle position across two different cars, you end up writing and maintaining
a parser per vendor plus a channel-name lookup table that only you understand.
Then someone else writes the same thing next year.

The OpenECU Alliance is an attempt to do that work once, in the open.

**What it actually is**

A specification for describing an ECU log format, or an ECU CAN broadcast, in a
YAML file. For a log adapter, that covers file type, extensions, delimiter,
structure, and then per channel: the vendor's own name (or names — many ECUs
changed labels between firmware versions), the canonical ID it maps to, the unit
as written in the file, and a conversion to the canonical unit if they differ.

For a CAN protocol it covers baudrate, message IDs, and for each signal: start
bit, length, byte order, scale, offset and range.

Behind both sits a canonical channel registry — 466 IDs across 20 categories
(engine, fuel, ignition, temperature, pressure, electrical, suspension, and so
on). That registry is what turns nine incompatible formats into one queryable
dataset.

**Why YAML and no library**

Deliberate. The moment this ships as a library, it only helps people writing in
that language. As data, it helps everyone. Read it in Rust, Python, C++, Kotlin,
whatever your dash runs on. Nothing to link, nothing to version-pin, nothing to
go unmaintained in three years and take your project with it.

**What is covered today**

Log adapters: Haltech, Link, AiM, rusEFI, Speeduino, MegaSquirt/TunerStudio,
ECUMaster, RomRaider (Subaru), Emerald.

CAN broadcast protocols: Haltech Elite, AEM Infinity, Emtron, MaxxECU, Syvecs
S7, ECUMaster EMU, MegaSquirt, rusEFI, Speeduino.

**On the CAN side specifically**

This is the one I would point a dash builder at. Most CAN broadcast integrations
start with a vendor PDF and a lot of careful transcription of bit offsets and
scaling factors. The spec files carry that data in a form your build can consume,
and there is a validator that checks for duplicate or out-of-range CAN IDs,
overlapping signals, and signals that run off the end of their frame. That
validator caught two genuine errors in our own files the first time it ran,
which is the strongest argument for it that I can make.

Where a vendor's documentation contradicts itself, we record the conflict in the
file rather than quietly guessing. You get to see that we were not sure, instead
of finding out at 3000rpm.

**Where to find it**

https://oecua.org — browse adapters and protocols, see every channel and signal,
and download the raw YAML. There is a JSON API too if you want to pull it in
programmatically.

**What we need**

Adapters. Specifically MoTeC, AEM, Holley and FuelTech log formats, but honestly
any ECU with users. If you have a format documented well enough that you have
already written a parser for it, converting that knowledge into an adapter file
is an evening's work, and it means the next person does not have to repeat it.

Happy to answer questions here, and happy to be told I got something wrong about
a format — that is the point of publishing it.

---

## 5. X / Twitter thread

1/
Every aftermarket ECU logs in its own format, with its own channel names, in its
own units.

So every tool that reads them writes its own parser. Every time. Forever.

We published an open spec to end that. https://oecua.org

2/
The OpenECU Spec describes an ECU log format or a CAN broadcast as plain YAML.

Structure, delimiters, bit offsets, byte order, scaling — and a mapping from the
vendor's channel names to a shared registry of 466 canonical IDs across 20
categories.

3/
No SDK. No runtime. No library to adopt.

It is data. Read it from Rust, Python, C, Kotlin, whatever your dash or logger is
written in. Nothing to version-pin, nothing to abandon.

4/
Covered today:

Logs — Haltech, Link, AiM, rusEFI, Speeduino, MegaSquirt, ECUMaster, RomRaider,
Emerald

CAN broadcast — Haltech Elite, AEM Infinity, Emtron, MaxxECU, Syvecs S7,
ECUMaster EMU, MegaSquirt, rusEFI, Speeduino

5/
The CAN files are the sleeper feature.

If you have built a digital dash off a vendor PDF, you have hand-copied bit
offsets and then debugged why coolant temp reads 4000 degrees.

These are machine-readable, and a validator checks every frame for overlaps and
overflows.

6/
One rule we hold to: the adapter describes the file as it actually is.

If the vendor logs psi, the adapter says psi and carries the conversion. A spec
that quietly "fixes" the unit is a spec that lies about the data you are holding.

7/
It is open, free, and the whole point is that nobody writes the Haltech CSV
parser a tenth time.

Missing your ECU? It is one YAML file and a pull request.

https://oecua.org

---

## 6. LinkedIn

Aftermarket engine ECUs are a small, brilliant, deeply fragmented software
ecosystem. Every manufacturer logs data in its own format, names the same sensor
differently, and broadcasts CAN frames documented in a PDF. Every tool built on
top of that data pays the integration cost again from zero.

We published the OpenECU Spec to stop paying it.

It is an open, machine-readable description of ECU log formats and CAN broadcast
protocols — plain YAML, no SDK, no runtime, no reference implementation you are
required to adopt. Vendor channel names map onto a shared registry of 466
canonical IDs across 20 categories, with unit conversions declared in the file
rather than buried in someone's parser.

Nine log formats and nine CAN protocols are published today, covering Haltech,
Link, AiM, rusEFI, Speeduino, MegaSquirt, ECUMaster, Subaru/RomRaider, Emerald,
AEM, Emtron, MaxxECU and Syvecs.

The interesting engineering constraint was truthfulness. An adapter's unit field
describes what the log file contains, not what we would prefer it contained, and
where a vendor's own documentation contradicts itself we record the conflict
instead of silently resolving it. A spec that lies about the data it describes is
worse than no spec at all.

Browse the catalog, the JSON API and the raw files: https://oecua.org

Contributions welcome, particularly MoTeC, AEM, Holley and FuelTech log formats.

---

## 7. YouTube community post / newsletter blurb

New project, and this one is for the people who build the tools.

Every ECU logs differently. Different file format, different channel names,
different units. If you have ever tried to compare a Haltech log against a
Speeduino log, you have felt it.

We published an open spec that describes those formats as machine-readable
files, and maps every vendor's channel names onto one shared vocabulary — 466
canonical channels. It covers CAN broadcast protocols too, which means digital
dash builders no longer have to hand-copy bit offsets out of a PDF.

Nine ECUs covered so far, and it is free and open to anyone.

https://oecua.org

---

## 8. GitHub Discussions / README announcement

**Title:** The adapter and protocol catalog is live at oecua.org

We now have a browsable home for every published adapter and CAN protocol,
with a JSON API and raw YAML downloads on every page: https://oecua.org

What is there today:

- 9 log adapters (Haltech, Link, AiM, rusEFI, Speeduino, MegaSquirt,
  ECUMaster, RomRaider, Emerald)
- 9 CAN broadcast protocols (Haltech Elite, AEM Infinity, Emtron, MaxxECU,
  Syvecs S7, ECUMaster EMU, MegaSquirt, rusEFI, Speeduino)
- A canonical channel registry of 466 IDs across 20 categories, published as
  machine-readable YAML and as generated documentation
- A validator that checks every adapter and protocol against the registry and
  gates the deploy — unknown channel IDs, category mismatches, missing unit
  conversions, implausible baud rates, duplicate or out-of-range CAN IDs,
  overlapping signals, and signals that overflow their frame

If you maintain a tool that reads ECU data, everything here is consumable
directly: `GET /api/adapters`, `GET /api/protocols`, and a raw endpoint per
file.

If you know an ECU we have not covered, an adapter is a single YAML file. The
gaps we would most like closed are MoTeC, AEM, Holley and FuelTech log formats.
