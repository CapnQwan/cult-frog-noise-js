import { Easing, lerp } from '@cult-frog/math';

import { Hashes } from '../hashes/index.js';

/**
 * Dot product of the gradient hashed for lattice corner (`cx`, `cy`) with the
 * offset (`dx`, `dy`) from that corner to the sample point.
 *
 * The eight gradients are (±1, 0), (0, ±1) and (±1, ±1), picked by integer hash
 * and a switch instead of an angle. ECMAScript lets engines approximate trig
 * functions differently, so angle-based gradients would make the same seed give
 * different noise in different engines; this uses only exact operations.
 */
export function corner2(cx: number, cy: number, dx: number, dy: number, seed: number) {
  switch (Hashes.hash2(cx, cy, seed) & 7) {
    case 0:
      return dx;
    case 1:
      return -dx;
    case 2:
      return dy;
    case 3:
      return -dy;
    case 4:
      return dx + dy;
    case 5:
      return dx - dy;
    case 6:
      return -dx + dy;
    default:
      return -dx - dy;
  }
}

/**
 * One octave of 2D Perlin noise at (`x`, `y`) in lattice units, in [-1, 1].
 *
 * Exactly 0 at every integer point. The ±1 bound is only reached near cell
 * centres where diagonal gradients line up, so most values sit well inside it.
 * The smootherstep fade keeps the first and second derivatives continuous across
 * cell borders. Corner coordinates are truncated to int32 by the hash, so the
 * pattern repeats beyond ±2^31.
 *
 * Seeded output must match across engines, so this may only use exact
 * operations: + − × ÷, floor, sqrt, integer and bitwise ops. Engine-approximated
 * functions such as sin, cos, exp and pow break that.
 */
export function sample2(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const dx = x - x0;
  const dy = y - y0;

  const n00 = corner2(x0, y0, dx, dy, seed);
  const n10 = corner2(x0 + 1, y0, dx - 1, dy, seed);
  const n01 = corner2(x0, y0 + 1, dx, dy - 1, seed);
  const n11 = corner2(x0 + 1, y0 + 1, dx - 1, dy - 1, seed);

  const u = Easing.Smooth.smootherstep(dx);
  const v = Easing.Smooth.smootherstep(dy);
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}
