import { describe, expect, it } from 'vite-plus/test';
import { bloscLz4Decode, lz4DecodeBlock } from '../../server/utils/blosc-lz4';
import {
  GRRR_INGEST_STEPS,
  grrrIdFromUtf32,
  grrrIdsFromVlen,
  grrrIngestStep,
} from '../../server/utils/grrr-ingest';

function utf32(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length * 4);
  for (let i = 0; i < text.length; i++) bytes[i * 4] = text.charCodeAt(i);
  return bytes;
}

function u32(value: number): number[] {
  return [value & 255, (value >> 8) & 255, (value >> 16) & 255, value >>> 24];
}

describe('grrrIngestStep', () => {
  it('runs 20 parquet slices, 64 streamflow id chunks, then 4 outlet chunks', () => {
    expect(GRRR_INGEST_STEPS).toBe(88);
    expect(grrrIngestStep(0)).toEqual({ kind: 'rp', index: 0 });
    expect(grrrIngestStep(19)).toEqual({ kind: 'rp', index: 19 });
    expect(grrrIngestStep(20)).toEqual({ kind: 'row', index: 0 });
    expect(grrrIngestStep(83)).toEqual({ kind: 'row', index: 63 });
    expect(grrrIngestStep(84)).toEqual({ kind: 'outlet', index: 0 });
    expect(grrrIngestStep(87)).toEqual({ kind: 'outlet', index: 3 });
    expect(grrrIngestStep(88)).toBeNull();
  });
});

describe('GRRR id decoding', () => {
  it('reads the number of a fixed-length UTF-32 id at an offset', () => {
    const bytes = new Uint8Array([
      ...utf32('subhybas_1120000010'),
      ...utf32('subhybas_2120476740'),
    ]);
    expect(grrrIdFromUtf32(bytes, 0)).toBe(1120000010);
    expect(grrrIdFromUtf32(bytes, 76)).toBe(2120476740);
  });

  it('reads the numbers of a vlen-utf8 chunk', () => {
    const enc = new TextEncoder();
    const ids = ['subhybas_6120007000', 'subhybas_2120476740'];
    const bytes = new Uint8Array([
      ...u32(ids.length),
      ...ids.flatMap((id) => [...u32(id.length), ...enc.encode(id)]),
    ]);
    expect(grrrIdsFromVlen(bytes)).toEqual([6120007000, 2120476740]);
  });
});

describe('lz4DecodeBlock', () => {
  it('copies literals and expands an overlapping match', () => {
    // token 0x35: 3 literals "abc", then a match of 5 + 4 = 9 bytes at offset 3.
    const src = new Uint8Array([0x35, 97, 98, 99, 3, 0]);
    const out = new Uint8Array(12);
    lz4DecodeBlock(src, out);
    expect(new TextDecoder().decode(out)).toBe('abcabcabcabc');
  });
});

describe('bloscLz4Decode', () => {
  it('joins split, uncompressed streams and reverses the byte shuffle', () => {
    // Two 2-byte elements [0x0102, 0x0304] little endian: plain 02 01 04 03.
    // Shuffled: low bytes 02 04, then high bytes 01 03, one stream each.
    const header = [2, 1, 0x01, 2, ...u32(4), ...u32(4), ...u32(0)];
    const offsets = u32(20);
    const streams = [...u32(2), 2, 4, ...u32(2), 1, 3];
    const out = bloscLz4Decode(
      new Uint8Array([...header, ...offsets, ...streams]),
    );
    expect([...out]).toEqual([2, 1, 4, 3]);
  });

  it('decodes one LZ4 stream when the block is not split', () => {
    const lz4 = [0x35, 97, 98, 99, 3, 0];
    const header = [2, 1, 0x10, 1, ...u32(12), ...u32(12), ...u32(0)];
    const bytes = new Uint8Array([
      ...header,
      ...u32(20),
      ...u32(lz4.length),
      ...lz4,
    ]);
    expect(new TextDecoder().decode(bloscLz4Decode(bytes))).toBe(
      'abcabcabcabc',
    );
  });
});
