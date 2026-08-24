# Adapter and Protocol Deep Pass — Audit and Plan

**Date:** 2026-08-24
**Status:** Phases 1-3 shipped 2026-08-24. Phases 4-5 outstanding.
**Scope:** all 9 adapters and 9 protocols in `specs/`.

The last content pass on these files was January 2025. This document records what
is actually in them today, what the vendors publish today, and the gap between
the two. Every number below is derived from a primary source, cited inline.

---

## 1. Current state

| | files | version | dated | items |
| --- | --- | --- | --- | --- |
| Adapters | 9 | all `1.0.0` | 8 of 9 in Jan 2025; MegaSquirt Feb 2026 | 322 channels |
| Protocols | 9 | all `1.0.0` except Haltech `3.0.0` | Jan 2025 – Jan 2026 | 216 messages / 912 signals |

---

## 2. Correctness defects

These are wrong in the shipped files. Both are the same failure mode: an
integration built from our spec receives **nothing at all**, because it is
listening at the wrong bit rate or the wrong addresses. This is worse than
missing data — it is confidently wrong data.

### 2.1 MaxxECU — wrong bus speed and wrong message IDs

`specs/protocols/maxxecu/maxxecu-default.protocol.yaml`

**Bus speed.** We declare `baudrate: 1000000`. MaxxECU's own webhelp — the page
our file cites as its `website` — states *"Can baud rate: 500kbit, 11-bit ID."*
AiM's MaxxECU CAN 1.05 integration guide independently instructs setting *"CAN1
Bitrate as 500kbit"*. Two independent sources, both 500 kbit.

**Message IDs.** We declare 25 messages at `0x600`–`0x618`. The documented
default protocol uses `0x520`–`0x528` (FAST, 50 Hz) and `0x530`–`0x542` (SLOW,
10 Hz). The `0x600` base appears to have been taken from MaxxECU's **Expansion
Module base address**, which is a different feature on a different page. The
default output protocol has no configurable base.

Our `known_issues` entry "Base address is configurable in MaxxTune - default is
0x600" encodes the same confusion and must go.

### 2.2 ECUMaster — wrong bus speed

`specs/protocols/ecumaster/ecumaster-emu-broadcast.protocol.yaml`

We declare `baudrate: 1000000` and state *"Protocol operates at 1Mbit/s by
default"* in both the header comment and the integration notes. ECUMaster's
published EMU / EMU Black CAN application note specifies **"CAN Bus Speed: 500
Kbit/sec"** with base ID 600. 1 Mbit is a distinct hardware variant ("EMU 1MB"),
not the default.

Each file states its baud in three places (header comment, `protocol.baudrate`,
integration notes). All three need fixing.

**Audited clean:** AEM (500k), Haltech (1 Mb), MegaSquirt (500k), rusEFI (500k),
Speeduino (500k), Syvecs (1 Mb) all match their published documentation.
Emtron (1 Mb) is stated by the file's own setup instructions and was not
independently confirmed.

---

## 3. Structural defects

### 3.1 Protocol signals have no canonical IDs — the spec's core promise is unmet

Adapters carry 155 distinct canonical channel `id` values. Protocol signals carry
**zero** — they have a `name` (`'Manifold_Pressure'`) but no `id`. Measured
across all 18 files, adapter IDs and protocol IDs share **no** common vocabulary,
because one of the two sets is empty.

The consequence: an application cannot correlate `map` read from a Haltech log
with manifold pressure read off the Haltech CAN bus. "Adapters map
vendor-specific names to canonical IDs" is the value proposition of the whole
spec, and half the corpus does not participate in it.

This is the highest-value fix in this document and it needs no vendor research —
only a decision and a careful mapping pass.

### 3.2 The canonical ID registry does not exist

`CLAUDE.md:334` and `app/pages/docs/governance.vue:315` both point contributors
at `specs/SPECIFICATION.md` as the complete channel reference. **That file is not
in the repository.** The canonical vocabulary is currently defined only by
whatever the 9 adapters happen to use, which is why 3.3 below happened.

### 3.3 The same canonical ID carries incompatible units

Eight IDs are used with conflicting units across adapters:

| id | units in use |
| --- | --- |
| `map` | kpa, psi, mbar |
| `boost` | kpa, psi, bar |
| `vehicle_speed` | kph, mph, km/h |
| `fuel_pressure` | kpa, bar |
| `oil_pressure` | kpa, bar |
| `fuel_flow` | cc/min, g/s, l/h |
| `knock_level` | volts, decibels |
| `time` | seconds, milliseconds |

`kph` vs `km/h` is not even a unit disagreement, just two spellings of one unit.
A consumer that trusts `id` alone gets values off by orders of magnitude.

### 3.4 Protocols are unvalidated

`server/schemas/` contains only `adapter.ts`. There is no zod schema for protocol
YAML, so nothing catches a malformed protocol file at read time — including the
kind of error described in section 2.

### 3.5 Adapter schema drift

Adapter YAML uses `file_format.encoding` (e.g. `encoding: utf-8`), but
`AdapterFileFormatSchema` does not declare it. Zod strips unknown keys silently,
so the field is parsed and discarded — it never reaches the API response.

### 3.6 Protocol signals have no category

Adapter channels carry `category`, and the site groups the detail page by it.
Protocol signals have none, so protocol pages cannot offer the same grouping.

---

## 4. Coverage gaps — the new data

For the three vendors with fully machine-readable authoritative sources, current
coverage is measurable and low.

| adapter | our channels | vendor's logged fields | coverage | source |
| --- | --- | --- | --- | --- |
| `rusefi-mlg` | 46 | **711** | 6% | `LiveData.yaml` + 40 live-data structs, `rusefi/rusefi@master` |
| `speeduino-mlg` | 22 | **125** | 18% | `[Datalog]` in `reference/speeduino.ini`, sig `speeduino 202504-dev` |
| `romraider-csv` | 27 | **158** | 17% | `definitions/log_defs.xml`, SSM base params |

**rusEFI** is the largest gap by far. Our file predates roughly 30 live-data
structures that are all logged today: `knock_controller`, `boost_control`,
`launch_control_state`, `antilag_system_state`, `nitrous_control_state`,
`electronic_throttle`, `idle_state`, `vvt`, `wideband_state`,
`long_term_fuel_trim_state`, `high_pressure_fuel_pump`,
`shift_torque_reduction_state`, `misfire_detection_state`, `fan_control`,
`tcu_controller` and more.

**Speeduino** is missing knock (retard, detected, event count), VVT1/VVT2
angle/target/duty, boost target and duty, fuel and oil pressure, the full engine
protection set, fuel staging, flex/ethanol, EMAP, fuel and ignition load, sync
status and loss counter, gear, both speed channels, WMI, fan duty, 16 aux inputs
and 8 programmable outputs.

**RomRaider** is missing the entire Subaru VVT/OCV set (intake and exhaust,
left and right), per-cylinder roughness monitors, the air/fuel sensor
current/resistance/heater channels, wastegate duty (primary and secondary),
fuel pressure high, and most of the body/switch inputs.

**MaxxECU protocol** — separately from the defects in 2.1, the vendor doc marks
a large block of messages as added in firmware **v1.135+** and **v1.149+**:
user channels 1–12, status/limiter bit flags, three-axis acceleration, lambda
target, the knock block, VVT positions and targets, oil pressure and
temperature, fuel/wastegate/coolant pressure, boost target, virtual fuel tank,
transmission and differential temperature, and ECU error codes.

**Not yet quantified:** Link (PCLink exposes 400+ runtime parameters against our
57 channels), ECUMaster, AiM, Haltech, Emerald, MegaSquirt, AEM, Emtron, Syvecs.
Haltech and Link publish only PDFs or in-application help, so those need a
slower pass.

---

## 5. Staleness

- Every adapter is still `1.0.0`; 8 of 9 are dated January 2025.
- `tested_with` on both rusEFI files reads "firmware 2024.xx | 2025.xx". It is
  now 2026 and the Speeduino INI signature is `202504-dev`.
- `speeduino-broadcast` `known_issues` asserts oil temperature, coolant
  pressure and wastegate pressure are "not supported" and that staging duty and
  the 0x369 trigger diagnostics message are unimplemented. All five claims are
  over a year old and need rechecking against current firmware.

---

## 6. Proposed plan

Ordered by value per unit of risk. Phases 1–3 need no vendor research.

**Phase 1 — correctness. DONE (2026-08-24).** MaxxECU rebuilt from the vendor
table at the correct IDs and baud (`2.0.0`, 22 messages / 100 signals);
ECUMaster baud corrected (`1.0.1`). Verified on workerd.

**Phase 2 — the spec's foundation. DONE (2026-08-24).** `specs/channels.yaml` is
the machine-readable registry and `SPECIFICATION.md` is generated from it.

One correction to the plan as written above: the unit mandate does **not** live
in the adapter. An adapter's `unit` describes what the log file actually
contains, so rewriting psi to kPa would make the spec lie about the file.
Instead the registry mandates the canonical unit and the channel declares
`to_canonical: {scale, offset}` — surfaced by the API as `toCanonical` and shown
as a badge on the detail page. Two IDs were split rather than converted:
`fuel_flow` (l/h) vs `fuel_flow_mass` (g/s), and `knock_level` (volts) vs
`knock_level_db` (dB); neither pair is inter-convertible.

`scripts/validate-specs.ts` enforces all of it and gates the deploy. On its first
run it found two defects nothing else had: `Distance_Traveled` ran 8 bits past
the end of rusEFI's `0x200` frame (fixed from the C struct — the status flags all
pack into byte 4, which had pushed gear and distance a byte late), and Haltech
`0x477` has two 16-bit signals starting 8 bits apart. Haltech's is genuinely
ambiguous, so it is marked `disputed` rather than guessed. The protocol zod
schema and the `encoding` field are in.

**Phase 3 — canonical IDs on protocol signals. DONE (2026-08-24).** The registry
grew from 140 to 371 channels to cover CAN-only quantities (status flags as a new
`status` category, nitrous and anti-lag, per-cylinder ignition and knock, indexed
analog/digital inputs, bank-2 cam positions, tyre sensors, cruise control).

**741 of 905 signals (82%) now carry a canonical id**, up from zero. The rest are
declared rather than left silent: 137 `vendor_specific` (a real measurement with
no canonical equivalent — DSG, Haltech torque management, diagnostics) and 27
`reserved` (padding and OBD transport framing). Nothing is unmarked, so a gap in
the mapping is now distinguishable from a deliberate exclusion.

Per protocol: rusEFI 100%, MaxxECU 98%, ECUMaster 84%, MegaSquirt 83%, Syvecs
81%, Haltech 78%, AEM 78%, Emtron 74%, Speeduino 64%.

**Phase 4 — coverage.** Regenerate adapter channel lists from the authoritative
sources, vendor by vendor, highest gap first: rusEFI, Speeduino, RomRaider,
Link, then the rest. Refresh `tested_with` and re-verify every `known_issues`
claim.

**Phase 5 — keep it from rotting.** The open-source vendors (rusEFI, Speeduino,
RomRaider, MegaSquirt) publish machine-readable definitions at stable URLs. A
scheduled job can diff them against our YAML and open an issue when they drift,
so the next gap is caught in weeks rather than 19 months.

---

## 7. Open decisions

1. **Versioning.** Adding channels is backward compatible (`1.1.0`). Changing a
   channel's unit to resolve section 3.3, or renumbering MaxxECU's messages, is
   not (`2.0.0`). Which do the affected files take?
2. **Coverage target.** Do adapters aim for full vendor parity (711 channels for
   rusEFI), or a curated set with the long tail of debug/internal fields left
   out? Full parity is more honest but makes the detail pages very long.
3. **Unit policy.** Mandate one unit per canonical ID in the registry and convert
   at the adapter, or keep per-adapter units and require consumers to read
   `unit`? The former is the stronger spec.
4. **Multi-version files.** The API already supports `?version=X.Y.Z`. Do new
   versions live beside the old ones, or replace them?

---

## Sources

- MaxxECU default CAN protocol — <https://www.maxxecu.com/webhelp/can-default_maxxecu_protocol.html>
- AiM Infotech MaxxECU CAN 1.05 — <https://support.aimshop.com/downloads/ecu/maxxecu/MaxxECU_CAN_105_eng.pdf>
- AiM ECUMaster EMU / EMU Black CAN 1.02 — <https://www.aim-sportline.com/download/ecu/racing/EcuMaster_EMU+EMUBlack_CAN_102_eng.pdf>
- rusEFI live data — <https://github.com/rusefi/rusefi> `firmware/integration/LiveData.yaml`
- Speeduino INI — <https://github.com/noisymime/speeduino> `reference/speeduino.ini`
- RomRaider logger definitions — <https://github.com/RomRaider/RomRaider> `definitions/log_defs.xml`
- Haltech CAN broadcast protocol — <https://support.haltech.com/portal/en/kb/articles/haltech-can-ecu-broadcast-protocol>
