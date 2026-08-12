export type Vec2 = readonly [number, number];

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Fritsch–Carlson monotone cubic. Interpolates strictly-increasing x
 * keyframes with a C1 curve that passes every key exactly, preserves
 * monotonicity between keys, and carries interior key velocity (no dead
 * stops, no overshoot). Input clamped to the keyframe domain.
 *
 * Clean-room implementation of the published standard algorithm; part of
 * the camera choreography inspired by
 * https://github.com/Makio64/threejs-cinematic-world-zoom (MIT).
 */
export function smoothTrack(keyframes: readonly Vec2[]): (t: number) => number {
  const n = keyframes.length;
  const xs = keyframes.map((k) => k[0]);
  const ys = keyframes.map((k) => k[1]);
  const h: number[] = [];
  const delta: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1]! - xs[i]!;
    delta[i] = (ys[i + 1]! - ys[i]!) / h[i]!;
  }
  m[0] = delta[0]!;
  m[n - 1] = delta[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    if (delta[i - 1]! * delta[i]! <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * h[i]! + h[i - 1]!;
      const w2 = h[i]! + 2 * h[i - 1]!;
      m[i] = (w1 + w2) / (w1 / delta[i - 1]! + w2 / delta[i]!);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    const a = m[i]!;
    const b = m[i + 1]!;
    const d = delta[i]!;
    if (d !== 0 && a > 0 === b > 0) {
      const alpha = a / d;
      const beta = b / d;
      if (alpha * alpha + beta * beta > 9) {
        const tau = 3 / Math.sqrt(alpha * alpha + beta * beta);
        m[i] = tau * alpha * d;
        m[i + 1] = tau * beta * d;
      }
    }
  }
  return (t: number): number => {
    const x = Math.min(Math.max(t, xs[0]!), xs[n - 1]!);
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid]! <= x) lo = mid;
      else hi = mid;
    }
    const i = Math.min(lo, n - 2);
    const hx = xs[i + 1]! - xs[i]!;
    const s = hx > 0 ? (x - xs[i]!) / hx : 0;
    const s2 = s * s;
    const s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1;
    const h10 = s3 - 2 * s2 + s;
    const h01 = -2 * s3 + 3 * s2;
    const h11 = s3 - s2;
    return (
      h00 * ys[i]! + h10 * hx * m[i]! + h01 * ys[i + 1]! + h11 * hx * m[i + 1]!
    );
  };
}

/** Exponential relaxation: value(tLocal) approaches 1, carrying exit velocity. */
export function approach(tLocal: number, tau: number): number {
  return 1 - Math.exp(-tLocal / tau);
}
