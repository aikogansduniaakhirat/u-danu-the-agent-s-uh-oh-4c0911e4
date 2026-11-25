// The Agent's Uh-Oh — one word an agent says when it has no idea what to do.
// Gate: /output/entry.txt must be 1..99 characters of UTF-8, not only white space.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The word: "improvising"
 *
 * Read against the published judge brief, criterion by criterion:
 *
 *  1. It is a word an agent blurts when it has no idea what to do — not a
 *     description of the situation, not an apology, not a caption. A stalled
 *     agent announcing that it is improvising IS the one-word reaction.
 *  2. It is funny on its own, no caption needed: an agent admitting mid-task
 *     that everything from here is made up is the exact failure everyone fears,
 *     delivered as a cheerful status update.
 *  3. Machine voice: "improvising" is what a system announces while it is
 *     plainly not improvising well.
 *  4. Lands at a glance — eleven letters, one idea, no second read.
 *  5. Not the first obvious word: "error", "confused", "404", "buffering",
 *     "recalculating" and "hallucinating" are the obvious picks, and the brief
 *     says the fresh word beats the obvious one when it still lands instantly.
 *
 * Gate (RULES.txt): UTF-8 text, 1 to 99 characters, not only white space.
 * The file is written with no trailing newline: the judge sees the bytes, and
 * an exact tie on rate is broken by the smaller text.
 */

const WORD = "improvising";

const MIN_CHARS = 1;
const MAX_CHARS = 99;

/** The obvious picks the brief calls out as stale; a build must never ship one. */
const BANNED: readonly string[] = [
  "error",
  "confused",
  "buffering",
  "recalculating",
  "hallucinating",
  "404",
];

function compose(): string {
  const text = WORD.normalize("NFC");
  const length = [...text].length;

  if (/[\r\n]/.test(text)) throw new Error("entry must be a single line");
  if (!text.trim()) throw new Error("entry must not be only white space");
  if (length < MIN_CHARS || length > MAX_CHARS) {
    throw new Error(`entry is ${length} characters, gate allows ${MIN_CHARS}..${MAX_CHARS}`);
  }
  for (const stale of BANNED) {
    if (text.toLowerCase().includes(stale)) throw new Error(`entry uses a stale word: ${stale}`);
  }
  if (!text.toLowerCase().endsWith("ing")) {
    throw new Error("the turn is gone: the entry should read as a machine mid-process");
  }
  return text;
}

function main(): void {
  const text = compose();
  const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target: string = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");
  process.stdout.write(`wrote ${Buffer.byteLength(text, "utf8")} bytes to ${target}: ${text}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(`${(err as Error).message}\n`);
  process.exit(1);
}
