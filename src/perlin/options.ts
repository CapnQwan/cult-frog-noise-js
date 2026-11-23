import type { Perlin2dOptions, Perlin3dOptions } from './_types/options.js';

/**
 * Upper bound on `octaves`. At lacunarity 2 the last octave already has 2^31
 * lattice cells per first-octave cell, far finer than one map cell, and at the
 * default persistence its amplitude is below Float32 resolution. Each octave
 * costs a full sample per cell and a slot in the per-call octave table, so the
 * cap also bounds the cost of a single call.
 */
const MAX_OCTAVES = 32;

/**
 * Upper bound on |world coordinate + octave offset| for any map: a safe-integer
 * offset (< 2^53), plus a map extent that cannot exceed 2^53 cells, plus the
 * octave offset range, rounded up with headroom so rounding near the limit
 * cannot matter.
 */
const MAX_WORLD_COORDINATE = 2 ** 55;

/**
 * Highest per-octave frequency, built with the same repeated multiplication the
 * sampler uses. With lacunarity below 1 the frequency falls each octave, so the
 * first octave is the highest.
 */
function getMaxFrequency(octaves: number, lacunarity: number): number {
  let frequency = 1;
  let maxFrequency = 1;
  for (let i = 1; i < octaves; i++) {
    frequency *= lacunarity;
    if (frequency > maxFrequency) maxFrequency = frequency;
  }
  return maxFrequency;
}

/**
 * Throws if `options` breaks a contract in {@link Perlin2dOptions}.
 *
 * The last check rejects combinations whose individual values are fine but
 * whose highest sample coordinate would overflow to Infinity, which turns every
 * sample into NaN. It assumes the worst-case world position rather than this
 * map's offsets, so options accepted for one chunk are accepted for every chunk
 * of the same world.
 */
export function validateOptions2(options: Perlin2dOptions): void {
  if (!Number.isInteger(options.seed)) throw new RangeError('Invalid seed');
  if (!(Number.isSafeInteger(options.offsetX) && Number.isSafeInteger(options.offsetY)))
    throw new RangeError('Invalid offsetX or offsetY');
  if (
    !(Number.isInteger(options.octaves) && options.octaves >= 1 && options.octaves <= MAX_OCTAVES)
  )
    throw new RangeError('Invalid octaves');
  if (!(Number.isFinite(options.lacunarity) && options.lacunarity > 0))
    throw new RangeError('Invalid lacunarity');
  if (!(options.persistence >= 0 && options.persistence <= 1))
    throw new RangeError('Invalid persistence');
  if (!(Number.isFinite(options.scale) && options.scale > 0)) throw new RangeError('Invalid scale');

  const maxScaledFrequency =
    (1 / options.scale) * getMaxFrequency(options.octaves, options.lacunarity);
  if (!Number.isFinite(MAX_WORLD_COORDINATE * maxScaledFrequency))
    throw new RangeError('Invalid scale, lacunarity, or octaves');
}

/** Throws if `options` breaks a contract in {@link Perlin3dOptions}. */
export function validateOptions3(options: Perlin3dOptions): void {
  validateOptions2(options);
  if (!Number.isSafeInteger(options.offsetZ)) throw new RangeError('Invalid offsetZ');
}
