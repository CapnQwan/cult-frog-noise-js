import { Easing, lerp } from '@cult-frog/math';

import { Hashes } from '../hashes/index.js';

/**
 * Brings the 3D sum inside [-1, 1]. With these gradients, eight corners can
 * reach about 1.0364 off-centre (near (0.48, 0.36, 0.5) in a cell), unlike 2D,
 * whose bound is exactly 1 at the centre. 1 / 1.03635 ≈ 0.96492, rounded down.
 */
const SAMPLE3_SCALE = 0.9649;

/**
 * Dot product of the gradient hashed for lattice corner (`cx`, `cy`, `cz`) with
 * the offset (`dx`, `dy`, `dz`) from that corner to the sample point.
 *
 * The twelve gradients are the cube's edge directions, (±1, ±1, 0), (±1, 0, ±1)
 * and (0, ±1, ±1), picked by integer hash rather than angle, so each dot product
 * is an exact sum and the same seed gives the same noise in every engine.
 * `Hashes.hash3` is unsigned, which keeps `% 12` in range.
 */
export function corner3(
  cx: number,
  cy: number,
  cz: number,
  dx: number,
  dy: number,
  dz: number,
  seed: number
) {
  switch (Hashes.hash3(cx, cy, cz, seed) % 12) {
    case 0:
      return dx + dy;
    case 1:
      return -dx + dy;
    case 2:
      return dx - dy;
    case 3:
      return -dx - dy;
    case 4:
      return dx + dz;
    case 5:
      return -dx + dz;
    case 6:
      return dx - dz;
    case 7:
      return -dx - dz;
    case 8:
      return dy + dz;
    case 9:
      return -dy + dz;
    case 10:
      return dy - dz;
    default:
      return -dy - dz;
  }
}

/**
 * One octave of 3D Perlin noise at (`x`, `y`, `z`) in lattice units, in [-1, 1].
 *
 * Exactly 0 at every integer point. Corner coordinates are truncated to int32 by
 * the hash, so the pattern repeats beyond ±2^31. Like `sample2`, this may only use
 * exact operations, so seeded output matches across engines.
 */
export function sample3(x: number, y: number, z: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const dx = x - x0;
  const dy = y - y0;
  const dz = z - z0;

  const n000 = corner3(x0, y0, z0, dx, dy, dz, seed);
  const n100 = corner3(x0 + 1, y0, z0, dx - 1, dy, dz, seed);
  const n010 = corner3(x0, y0 + 1, z0, dx, dy - 1, dz, seed);
  const n110 = corner3(x0 + 1, y0 + 1, z0, dx - 1, dy - 1, dz, seed);
  const n001 = corner3(x0, y0, z0 + 1, dx, dy, dz - 1, seed);
  const n101 = corner3(x0 + 1, y0, z0 + 1, dx - 1, dy, dz - 1, seed);
  const n011 = corner3(x0, y0 + 1, z0 + 1, dx, dy - 1, dz - 1, seed);
  const n111 = corner3(x0 + 1, y0 + 1, z0 + 1, dx - 1, dy - 1, dz - 1, seed);

  const u = Easing.Smooth.smootherstep(dx);
  const v = Easing.Smooth.smootherstep(dy);
  const w = Easing.Smooth.smootherstep(dz);

  const near = lerp(lerp(n000, n100, u), lerp(n010, n110, u), v);
  const far = lerp(lerp(n001, n101, u), lerp(n011, n111, u), v);
  return lerp(near, far, w) * SAMPLE3_SCALE;
}
