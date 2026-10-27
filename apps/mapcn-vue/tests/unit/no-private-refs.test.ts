import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

/**
 * Guard: no tracked file in this public repo may name a private repo or a
 * product built from one. The forbidden names are stored ONLY as SHA-256
 * digests of their lowercase form (words, hostnames, owner/repo slugs), so
 * this file never spells them out. Every lowercase word, hostname (and each
 * of its parent domains) and slug in every tracked text file is hashed and
 * compared against the list.
 */
const FORBIDDEN_DIGESTS = new Set([
  '72165796b67119a7b57759b350a2663346c1cefbf4a17c88d9bbb2fe7f35d478',
  '85d808232e01037fa6a8055cd090c1173854d72f6513f23ebcee6a3260d31660',
  'e2520c990efb01e3dd6542f071a56d7b1c8eb66dad3da1e89db544c56ddee0cf',
  'e2d14981b3895a8ece7be2206724c752ef1205882e4dc1ed6f745add079b9634',
  '7559a9a1a2623c9ec9bb334230a1005eaa7f4aebbf8fb9266313e49d57f84fea',
  '45df6e6712bdafb88a8b133ffbcf435d5bc458b5e90de18daf6f2245f540613f',
  'f1a3ec0ea4f47cd20634df7acee8a0583eaffc3772dfefa33989d0971f1549c0',
  'e4f743a670ac2a340e23542b6a72869b339e418de43406685bcd2705d1b694a5',
  'dc50f77b1cd9db35fd7b734401cee296869fe08612ae07904b6309f938d884a2',
  '0b9a5d20aa9c44fac80f4b7ae6ba685b59d71caf16301f1354eb4b148d623cc0',
  '15a489db9e9f88a9aed5059b9c3bdd12db4dad837cb14b06ea09cbc31f279430',
  '0c918cc13d6af28552094e90198f77c9072783088938c69c946e2c99fa95419f',
  '7dc93e700df37018813392832eaf7efd4ebbd84a820c54068764b21a9fa7d505',
]);

const digestCache = new Map<string, string>();
const sha256 = (value: string): string => {
  let digest = digestCache.get(value);
  if (digest === undefined) {
    digest = createHash('sha256').update(value).digest('hex');
    digestCache.set(value, digest);
  }
  return digest;
};

const candidates = (text: string): Set<string> => {
  const lower = text.toLowerCase();
  const out = new Set<string>();
  for (const word of lower.match(/[a-z0-9]+/g) ?? []) out.add(word);
  for (const host of lower.match(/[a-z0-9-]+(?:\.[a-z0-9-]+)+/g) ?? []) {
    const parts = host.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      out.add(parts.slice(i).join('.'));
    }
  }
  for (const slug of lower.match(/[a-z0-9-]+\/[a-z0-9.-]+/g) ?? []) {
    out.add(slug.replace(/\.+$/, ''));
  }
  return out;
};

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
  .split('\0')
  .filter(Boolean);

describe('private repo references', () => {
  it('tracked files never name a private repo or product', () => {
    const hits: string[] = [];
    for (const file of trackedFiles) {
      let buffer: Buffer;
      try {
        buffer = readFileSync(resolve(repoRoot, file));
      } catch {
        continue;
      }
      if (buffer.subarray(0, 8000).includes(0)) continue;
      const text = buffer.toString('utf8');
      if (!text.trim()) continue;
      for (const token of candidates(text)) {
        if (FORBIDDEN_DIGESTS.has(sha256(token))) {
          hits.push(`${file} (digest ${sha256(token).slice(0, 12)})`);
        }
      }
    }
    expect(hits).toEqual([]);
  }, 120_000);
});
