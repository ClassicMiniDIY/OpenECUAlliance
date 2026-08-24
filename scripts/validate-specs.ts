#!/usr/bin/env bun
/**
 * Validates every adapter and protocol in specs/ against the canonical channel
 * registry (specs/channels.yaml) and the zod schemas in server/schemas/.
 *
 * This exists because the corpus drifted for 19 months without anything
 * noticing: two protocols shipped an unusable baud rate, one shipped message
 * IDs that do not exist, and eight canonical IDs carried mutually incompatible
 * units. Every one of those is mechanically detectable.
 *
 * Usage:  bun scripts/validate-specs.ts [--json]
 * Exit 0 = clean, 1 = at least one error. Warnings do not fail the run.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { AdapterYamlSchema } from '../server/schemas/adapter';
import { ProtocolYamlSchema } from '../server/schemas/protocol';

const SPECS = join(import.meta.dir, '..', 'specs');
const REGISTRY = join(SPECS, 'channels.yaml');

type Issue = { level: 'error' | 'warn'; file: string; message: string };
const issues: Issue[] = [];
const err = (file: string, message: string) => issues.push({ level: 'error', file, message });
const warn = (file: string, message: string) => issues.push({ level: 'warn', file, message });

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.yaml') && e.name !== 'channels.yaml') out.push(p);
  }
  return out;
}

// --- registry ---------------------------------------------------------------
const registry = parse(readFileSync(REGISTRY, 'utf8'));
const canonical = new Map<string, any>();
const aliasOf = new Map<string, string>();
for (const c of registry.channels ?? []) {
  canonical.set(c.id, c);
  for (const a of c.aliases ?? []) aliasOf.set(a, c.id);
}
const spellings: Record<string, string> = registry.unit_spellings ?? {};
const conversions = new Set((registry.conversions ?? []).map((c: any) => `${c.from}->${c.to}`));
const normUnit = (u: unknown) => spellings[String(u ?? '').trim()] ?? String(u ?? '').trim();
const resolve = (id: string) => (canonical.has(id) ? id : aliasOf.get(id));

// --- adapters ---------------------------------------------------------------
const adapterFiles = walk(join(SPECS, 'adapters'));
for (const f of adapterFiles) {
  const rel = relative(SPECS, f);
  const raw = parse(readFileSync(f, 'utf8'));

  const parsed = AdapterYamlSchema.safeParse(raw);
  if (!parsed.success) {
    for (const i of parsed.error.issues) err(rel, `schema: ${i.path.join('.')} — ${i.message}`);
  }

  const seen = new Set<string>();
  for (const ch of raw.channels ?? []) {
    if (seen.has(ch.id)) err(rel, `duplicate channel id '${ch.id}'`);
    seen.add(ch.id);

    const canon = resolve(ch.id);
    if (!canon) {
      err(rel, `channel '${ch.id}' is not in the canonical registry (add it to specs/channels.yaml or use an existing id)`);
      continue;
    }
    if (canon !== ch.id) warn(rel, `channel '${ch.id}' is a deprecated alias for '${canon}'`);

    const spec = canonical.get(canon)!;
    if (spec.category !== ch.category) {
      err(rel, `channel '${ch.id}' has category '${ch.category}', registry says '${spec.category}'`);
    }

    const unit = normUnit(ch.unit);
    if (unit !== String(ch.unit ?? '').trim()) {
      warn(rel, `channel '${ch.id}' unit '${ch.unit}' should be spelled '${unit}'`);
    }
    if (unit !== spec.unit) {
      const conv = ch.to_canonical;
      if (!conv) {
        const known = conversions.has(`${unit}->${spec.unit}`);
        err(
          rel,
          `channel '${ch.id}' is in '${unit}' but canonical is '${spec.unit}' and no 'to_canonical' is declared` +
            (known ? ` (a ${unit}->${spec.unit} conversion exists in the registry)` : '')
        );
      } else if (typeof conv.scale !== 'number' || typeof conv.offset !== 'number') {
        err(rel, `channel '${ch.id}' has a malformed 'to_canonical' (needs numeric scale and offset)`);
      }
    } else if (ch.to_canonical) {
      warn(rel, `channel '${ch.id}' declares 'to_canonical' but already uses the canonical unit`);
    }
  }
}

// --- protocols --------------------------------------------------------------
const PLAUSIBLE_BAUD = new Set([125000, 250000, 500000, 800000, 1000000]);
const protocolFiles = walk(join(SPECS, 'protocols'));
for (const f of protocolFiles) {
  const rel = relative(SPECS, f);
  const raw = parse(readFileSync(f, 'utf8'));

  const parsed = ProtocolYamlSchema.safeParse(raw);
  if (!parsed.success) {
    for (const i of parsed.error.issues) err(rel, `schema: ${i.path.join('.')} — ${i.message}`);
  }

  const baud = raw.protocol?.baudrate;
  if (!PLAUSIBLE_BAUD.has(baud)) err(rel, `implausible CAN baudrate ${baud}`);

  const extended = raw.protocol?.extended_id === true;
  const seenIds = new Set<number>();
  for (const m of raw.messages ?? []) {
    const id = typeof m.id === 'number' ? m.id : parseInt(String(m.id), 16);
    if (seenIds.has(id)) err(rel, `duplicate message id 0x${id.toString(16).toUpperCase()}`);
    seenIds.add(id);

    const max = extended ? 0x1fffffff : 0x7ff;
    if (id > max) {
      err(rel, `message 0x${id.toString(16).toUpperCase()} exceeds the ${extended ? 29 : 11}-bit id range`);
    }

    const bits = (m.length ?? 8) * 8;
    const spans: [number, number, string, string | undefined][] = [];
    for (const s of m.signals ?? []) {
      if (typeof s.start_bit !== 'number' || typeof s.length !== 'number') {
        err(rel, `signal '${s.name}' in 0x${id.toString(16).toUpperCase()} is missing start_bit/length`);
        continue;
      }
      if (s.start_bit + s.length > bits) {
        err(rel, `signal '${s.name}' overflows frame 0x${id.toString(16).toUpperCase()}`);
      }
      spans.push([s.start_bit, s.start_bit + s.length - 1, s.name, s.disputed]);

      // Phase 3 target: every protocol signal should carry a canonical id.
      if (!s.id) warn(rel, `signal '${s.name}' in 0x${id.toString(16).toUpperCase()} has no canonical id`);
      else if (!resolve(s.id)) err(rel, `signal '${s.name}' has id '${s.id}' which is not in the registry`);
    }
    spans.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < spans.length; i++) {
      if (spans[i][0] <= spans[i - 1][1]) {
        // A signal may carry 'disputed' when the vendor's own documentation is
        // self-contradictory. That records the conflict instead of hiding it
        // behind a guess, so it degrades to a warning rather than failing.
        const reason = spans[i][3] ?? spans[i - 1][3];
        const msg = `signals '${spans[i - 1][2]}' and '${spans[i][2]}' overlap in 0x${id.toString(16).toUpperCase()}`;
        if (reason) warn(rel, `${msg} — disputed: ${reason}`);
        else err(rel, msg);
      }
    }
  }
}

// --- report -----------------------------------------------------------------
const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ errors, warnings: warns }, null, 2));
} else {
  const byFile = new Map<string, Issue[]>();
  for (const i of issues) byFile.set(i.file, [...(byFile.get(i.file) ?? []), i]);
  for (const [file, list] of [...byFile].sort()) {
    console.log(`\n${file}`);
    for (const i of list) console.log(`  ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.message}`);
  }
  console.log(
    `\n${adapterFiles.length} adapters, ${protocolFiles.length} protocols, ` +
      `${canonical.size} canonical channels — ${errors.length} errors, ${warns.length} warnings`
  );
}

process.exit(errors.length ? 1 : 0);
