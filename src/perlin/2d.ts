import { Random } from '@cult-frog/random';

import { Noise2D } from '../noiseMap/index.js';
import { DEFAULT_PERLIN_2D_OPTIONS } from './defaultOptions.js';
import { sample2 } from './sample2.js';

import type { Perlin2dOptions } from './_types/options.js';

const OFFSET_RANGE = 100_000;

/**
 * Seed-derived per-octave sample offsets (x, y interleaved) and the sum of all
 * octave amplitudes, which bounds the summed noise.
 *
 * The offsets stop every octave sharing the lattice origin. They deliberately
 * exclude `offsetX`/`offsetY`, so every chunk of a world adds the same constants
 * to the same exact integer world position and gets bit-identical samples.
 */
function getOctaveConfig(
  config: Perlin2dOptions
): [octaveOffsets: Float32Array, maxPossibleHeight: number] {
  const octaveOffsets = new Float32Array(config.octaves * 2);
  const prng = new Random(config.seed);

  let maxPossibleHeight = 0;
  let amplitude = 1;

  for (let i = 0; i < config.octaves; i++) {
    const index = i * 2;
    octaveOffsets[index] = prng.float(-OFFSET_RANGE, OFFSET_RANGE);
    octaveOffsets[index + 1] = prng.float(-OFFSET_RANGE, OFFSET_RANGE);

    maxPossibleHeight += amplitude;
    amplitude *= config.persistence;
  }

  return [octaveOffsets, maxPossibleHeight];
}

/**
 * Summed octaves at an integer world cell, in ±`maxPossibleHeight`. Assumes
 * `config` is validated: `octaveOffsets` then holds exactly `config.octaves`
 * pairs, so the indexed reads below are always in bounds.
 */
function samplePoint(
  worldX: number,
  worldY: number,
  config: Perlin2dOptions,
  octaveOffsets: Float32Array,
  invScale: number
): number {
  let amplitude = 1;
  let frequency = 1;
  let noiseHeight = 0;

  for (let i = 0; i < config.octaves; i++) {
    const index = i * 2;
    const scaledFrequency = invScale * frequency;
    const sampleX = (worldX + (octaveOffsets[index] as number)) * scaledFrequency;
    const sampleY = (worldY + (octaveOffsets[index + 1] as number)) * scaledFrequency;

    noiseHeight += sample2(sampleX, sampleY, config.seed) * amplitude;

    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  return noiseHeight;
}

/**
 * Creates a `width` × `height` map of fractal (multi-octave) Perlin noise in
 * [0, 1]. The caller owns the returned map.
 *
 * Each value depends only on its world cell (`x + offsetX`, `y + offsetY`) and
 * the other options, never on the map's size. Chunks of any size, created with
 * the same options and their world origin as the offset, agree bit for bit
 * wherever they overlap.
 *
 * The mapping to [0, 1] is fixed by the options, not stretched to each map's own
 * minimum and maximum; that is what keeps chunks consistent. The cost is
 * contrast: the fixed bound is the sum of octave amplitudes, which summed noise
 * rarely approaches. With the defaults (5 octaves, persistence 0.5) a 256 × 256
 * map spans roughly 0.2–0.8, while a single octave uses nearly all of [0, 1].
 * Stretch the result yourself if you need contrast more than tiling.
 *
 * Throws if the size is not a positive integer or an option breaks its contract
 * in {@link Perlin2dOptions}.
 */
export function create(
  width: number,
  height: number,
  options: Partial<Perlin2dOptions> = {}
): Noise2D {
  if (!(Number.isInteger(width) && Number.isInteger(height)))
    throw new Error('Invalid width or height');
  if (width <= 0 || height <= 0) throw new Error('Invalid width or height');

  const config = { ...DEFAULT_PERLIN_2D_OPTIONS, ...options };

  if (!Number.isInteger(config.seed)) throw new Error('Invalid seed');
  if (!(Number.isInteger(config.offsetX) && Number.isInteger(config.offsetY)))
    throw new Error('Invalid offsetX or offsetY');
  if (!(Number.isInteger(config.octaves) && config.octaves >= 1))
    throw new Error('Invalid octaves');
  if (!(Number.isFinite(config.lacunarity) && config.lacunarity > 0))
    throw new Error('Invalid lacunarity');
  if (!(config.persistence >= 0 && config.persistence <= 1)) throw new Error('Invalid persistence');
  if (!(Number.isFinite(config.scale) && config.scale > 0)) throw new Error('Invalid scale');

  const noise = Noise2D.create(width, height);
  const values = Noise2D.getValues(noise);
  const invScale = 1 / config.scale;

  const [octaveOffsets, maxPossibleHeight] = getOctaveConfig(config);
  const invRange = 0.5 / maxPossibleHeight;

  let index = 0;
  for (let y = 0; y < height; y++) {
    const worldY = y + config.offsetY;
    for (let x = 0; x < width; x++) {
      const worldX = x + config.offsetX;
      const value = samplePoint(worldX, worldY, config, octaveOffsets, invScale);
      values[index++] = value * invRange + 0.5;
    }
  }

  return noise;
}
