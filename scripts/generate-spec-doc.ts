#!/usr/bin/env bun
/**
 * Generates specs/SPECIFICATION.md from specs/channels.yaml.
 *
 * channels.yaml is the source of truth; the Markdown is a rendering of it.
 * Edit the YAML and re-run this — never hand-edit SPECIFICATION.md.
 *
 * Usage: bun scripts/generate-spec-doc.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const SPECS = join(import.meta.dir, '..', 'specs');

type Channel = {
  id: string;
  name: string;
  category: string;
  unit: string;
  data_type: string;
  description?: string;
  aliases?: string[];
  split_from?: string;
};

const reg = parse(readFileSync(join(SPECS, 'channels.yaml'), 'utf8')) as {
  openecualliance: string;
  version: string;
  updated: string;
  channels: Channel[];
  unit_spellings?: Record<string, string>;
  conversions?: Array<{ from: string; to: string; scale: number; offset: number }>;
};

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

// "Used by" counts how many adapters map each channel, so the doc shows at a
// glance which parts of the vocabulary are established and which are aspirational.
const aliasOf = new Map<string, string>();
for (const c of reg.channels) for (const a of c.aliases ?? []) aliasOf.set(a, c.id);

const use = new Map<string, number>();
const adapterFiles = walk(join(SPECS, 'adapters'));
for (const f of adapterFiles) {
  const y = parse(readFileSync(f, 'utf8')) as { channels?: Array<{ id: string }> };
  for (const ch of y.channels ?? []) {
    const id = aliasOf.get(ch.id) ?? ch.id;
    use.set(id, (use.get(id) ?? 0) + 1);
  }
}

const byCat = new Map<string, Channel[]>();
for (const c of reg.channels) byCat.set(c.category, [...(byCat.get(c.category) ?? []), c]);

const L: string[] = [];
L.push(`# OpenECU Spec — Channel Reference

**Spec version ${reg.openecualliance} · registry ${reg.version} · updated ${reg.updated}**

This is the canonical channel vocabulary for the OpenECU Spec. It is generated
from [\`channels.yaml\`](channels.yaml), which is the machine-readable source of
truth — **edit that file, not this one.**

Regenerate with:

\`\`\`bash
bun run generate:spec-doc
\`\`\`

---

## Why this file exists

An adapter maps a vendor's own column names onto a canonical channel ID, so an
application can read \`rpm\` from a Haltech log and a Link log without knowing
anything about either vendor. That only works if every adapter agrees on what
\`rpm\` means — the same ID, the same category, the same unit.

Until 2026-08-24 this file was referenced by the contributor docs but did not
exist, and the vocabulary was defined implicitly by whatever the nine adapters
happened to use. Eight IDs had drifted onto incompatible units: \`map\` was kPa
in seven adapters, psi in one and mbar in another. A consumer that trusted the
ID alone got readings off by an order of magnitude.

---

## The rules

1. **Every adapter channel \`id\` and every protocol signal \`id\` must appear in
   this registry**, either as a canonical ID or as a listed alias.
2. **\`unit\` on an adapter channel describes the log file, not the ideal.** If a
   vendor writes psi, the adapter says \`psi\`. Never rewrite it to look canonical
   — that makes the spec lie about the file.
3. **When the source unit differs from the canonical unit, declare the
   conversion** on the channel:

   \`\`\`yaml
   - id: map
     unit: psi
     to_canonical:
       scale: 6.89475729
       offset: 0
   \`\`\`

   A consumer computes \`canonical = raw * scale + offset\`. Adapters already in
   the canonical unit omit \`to_canonical\` entirely.
4. **Category must match the registry.** It drives grouping on the site.
5. **Aliases still resolve** but are deprecated. New adapters should use the
   canonical ID.
6. **A protocol signal that is not a measurement** carries \`reserved: true\`
   (padding, transport framing). One with no canonical equivalent carries
   \`vendor_specific: true\`. Both are deliberate declarations — an unmarked
   signal without an \`id\` is treated as an oversight.
7. **Adding a channel?** Add it to \`channels.yaml\` first, then use it. Run
   \`bun run validate:specs\` before opening a PR — CI runs it too.

---

## Units

One spelling per unit. The validator rejects anything else.

| quantity | canonical unit |
| --- | --- |
| pressure | \`kpa\` |
| temperature | \`celsius\` |
| speed | \`kph\` |
| angle | \`degrees\` |
| angular rate | \`deg/s\` |
| proportion | \`percent\` |
| air-fuel | \`lambda\`, \`afr\` |
| mass flow | \`g/s\` |
| volume flow | \`l/h\` |
| voltage | \`volts\` |
| length | \`meters\`, \`millimeters\` |
| acceleration | \`g\` |
| frequency | \`hz\` |
| time | \`seconds\`, \`milliseconds\` |
| torque | \`nm\` |
| engine speed | \`rpm\` |

### Accepted spellings

These normalise with no numeric change:

| written | canonical |
| --- | --- |`);
for (const [k, v] of Object.entries(reg.unit_spellings ?? {})) L.push(`| \`${k}\` | \`${v}\` |`);

L.push(`
### Conversions

\`canonical = raw * scale + offset\`

| from | to | scale | offset |
| --- | --- | --- | --- |`);
for (const c of reg.conversions ?? []) L.push(`| \`${c.from}\` | \`${c.to}\` | ${c.scale} | ${c.offset} |`);

L.push(`
---

## Channels

${reg.channels.length} canonical channels across ${byCat.size} categories. **Used by**
counts how many of the ${adapterFiles.length} adapters currently map the channel.
`);
for (const [cat, list] of [...byCat].sort()) {
  L.push(`### ${cat}\n`);
  L.push(`| id | name | unit | type | used by | description |`);
  L.push(`| --- | --- | --- | --- | --- | --- |`);
  for (const c of list.sort((a, b) => a.id.localeCompare(b.id))) {
    const al = c.aliases ? `<br>_aliases: ${c.aliases.map((a) => `\`${a}\``).join(', ')}_` : '';
    L.push(
      `| \`${c.id}\` | ${c.name}${al} | \`${c.unit || '—'}\` | ${c.data_type} | ${use.get(c.id) ?? 0} | ${c.description ?? ''} |`
    );
  }
  L.push('');
}

const dep = reg.channels.flatMap((c) => (c.aliases ?? []).map((a) => [a, c.id])).sort();
L.push(`---

## Deprecated aliases

Recognised for backward compatibility. Do not use in new adapters.

| deprecated | use instead |
| --- | --- |`);
for (const [a, c] of dep) L.push(`| \`${a}\` | \`${c}\` |`);

const splits = reg.channels.filter((c) => c.split_from);
L.push(`
---

## Split channels

These were one ID carrying two physically different measurements. They are not
inter-convertible, so they became separate channels rather than a unit
conversion.

| id | split from | unit | why |
| --- | --- | --- | --- |`);
for (const s of splits) L.push(`| \`${s.id}\` | \`${s.split_from}\` | \`${s.unit}\` | ${s.description} |`);

writeFileSync(join(SPECS, 'SPECIFICATION.md'), L.join('\n') + '\n');
console.log(`wrote SPECIFICATION.md — ${reg.channels.length} channels, ${dep.length} aliases`);
