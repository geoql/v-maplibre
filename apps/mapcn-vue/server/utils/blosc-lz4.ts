/**
 * Blosc 1 + LZ4 decoder, pure JavaScript.
 *
 * Workers forbid `eval`, so numcodecs' Emscripten build cannot run here. The
 * GRRR outlet store (Zarr v2) uses `blosc` with `cname: lz4` and byte shuffle.
 *
 * Blosc 1 layout: a 16-byte header, one 32-bit offset per block, then the
 * blocks. A block is either one stream or, unless the "don't split" flag is
 * set, `typesize` streams (one per byte position). Every stream is a 32-bit
 * compressed length plus an LZ4 block; a length equal to the raw length
 * means the stream is stored uncompressed.
 */

const FLAG_SHUFFLE = 0x01;
const FLAG_MEMCPYED = 0x02;
const FLAG_DONT_SPLIT = 0x10;

function u32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24)) >>>
    0
  );
}

/** Decodes one LZ4 block (no frame) into `out`, which has the raw length. */
export function lz4DecodeBlock(src: Uint8Array, out: Uint8Array): void {
  let s = 0;
  let d = 0;
  while (s < src.length) {
    const token = src[s++]!;
    let literals = token >> 4;
    if (literals === 15) {
      let b = 255;
      while (b === 255) literals += b = src[s++]!;
    }
    out.set(src.subarray(s, s + literals), d);
    s += literals;
    d += literals;
    if (s >= src.length) break;
    const offset = src[s]! | (src[s + 1]! << 8);
    s += 2;
    let match = (token & 15) + 4;
    if ((token & 15) === 15) {
      let b = 255;
      while (b === 255) match += b = src[s++]!;
    }
    for (let i = 0; i < match; i++, d++) out[d] = out[d - offset]!;
  }
  if (d !== out.length) {
    throw new Error(`lz4: decoded ${d} bytes, expected ${out.length}`);
  }
}

function unshuffle(src: Uint8Array, typesize: number): Uint8Array {
  const dst = new Uint8Array(src.length);
  const count = Math.floor(src.length / typesize);
  for (let p = 0; p < typesize; p++) {
    for (let e = 0; e < count; e++) dst[e * typesize + p] = src[p * count + e]!;
  }
  for (let i = count * typesize; i < src.length; i++) dst[i] = src[i]!;
  return dst;
}

export function bloscLz4Decode(bytes: Uint8Array): Uint8Array {
  const flags = bytes[2]!;
  const typesize = bytes[3]!;
  const nbytes = u32(bytes, 4);
  const blocksize = u32(bytes, 8);
  if (flags & FLAG_MEMCPYED) return bytes.slice(16, 16 + nbytes);

  const out = new Uint8Array(nbytes);
  const blocks = Math.ceil(nbytes / blocksize);
  for (let b = 0; b < blocks; b++) {
    const blockLength = Math.min(blocksize, nbytes - b * blocksize);
    const split = !(flags & FLAG_DONT_SPLIT) && blockLength % typesize === 0;
    const streams = split ? typesize : 1;
    const streamLength = blockLength / streams;
    const raw = new Uint8Array(blockLength);
    let at = u32(bytes, 16 + b * 4);
    for (let s = 0; s < streams; s++) {
      const csize = u32(bytes, at);
      const stream = bytes.subarray(at + 4, at + 4 + csize);
      const target = raw.subarray(s * streamLength, (s + 1) * streamLength);
      if (csize === streamLength) target.set(stream);
      else lz4DecodeBlock(stream, target);
      at += 4 + csize;
    }
    out.set(
      flags & FLAG_SHUFFLE ? unshuffle(raw, typesize) : raw,
      b * blocksize,
    );
  }
  return out;
}
