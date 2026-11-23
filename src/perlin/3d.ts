import { Random } from '@cult-frog/random';

import { Noise3D } from '../noiseMap/index.js';
import { DEFAULT_PERLIN_3D_OPTIONS } from './defaultOptions.js';
import { validateOptions3 } from './options.js';
import { sample3 } from './sample3.js';

import type { Perlin3dOptions } from './_types/options.js';

const OFFSET_RANGE = 100_000;

/**
 * Seed-derived per-octave sample offsets (x, y, z interleaved) and the sum of all
 * octave amplitudes, which bounds the summed noise.
 *
 * The offsets stop every octave sharing the lattice origin. They deliberately
 * exclude `offsetX`/`offsetY`/`offsetZ`, so every chunk of a world adds the same
 * constants to the same exact integer world position and gets bit-identical
 * samples.
 */
function getOctaveConfig(
  config: Perlin3dOptions
): [octaveOffsets: Float32Array, maxPossibleHeight: number] {
  const octaveOffsets = new Float32Array(config.octaves * 3);
  const prng = new Random(config.seed);

  let maxPossibleHeight = 0;
  let amplitude = 1;

  for (let i = 0; i < config.octaves; i++) {
    const index = i * 3;
    octaveOffsets[index] = prng.float(-OFFSET_RANGE, OFFSET_RANGE);
    octaveOffsets[index + 1] = prng.float(-OFFSET_RANGE, OFFSET_RANGE);
    octaveOffsets[index + 2] = prng.float(-OFFSET_RANGE, OFFSET_RANGE);

    maxPossibleHeight += amplitude;
    amplitude *= config.persistence;
  }

  return [octaveOffsets, maxPossibleHeight];
}

/**
 * Summed octaves at an integer world cell, in ±`maxPossibleHeight`. Assumes
 * `config` is validated: `octaveOffsets` then holds exactly `config.octaves`
 * triples, so the indexed reads below are always in bounds.
 */
function samplePoint(
  worldX: number,
  worldY: number,
  worldZ: number,
  config: Perlin3dOptions,
  octaveOffsets: Float32Array,
  invScale: number
): number {
  let amplitude = 1;
  let frequency = 1;
  let noiseHeight = 0;

  for (let i = 0; i < config.octaves; i++) {
    const index = i * 3;
    const scaledFrequency = invScale * frequency;
    const sampleX = (worldX + (octaveOffsets[index] as number)) * scaledFrequency;
    const sampleY = (worldY + (octaveOffsets[index + 1] as number)) * scaledFrequency;
    const sampleZ = (worldZ + (octaveOffsets[index + 2] as number)) * scaledFrequency;

    noiseHeight += sample3(sampleX, sampleY, sampleZ, config.seed) * amplitude;

    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  return noiseHeight;
}

/**
 * Creates a `width` × `height` × `depth` map of fractal (multi-octave) Perlin
 * noise in [0, 1]. The caller owns the returned map.
 *
 * Each value depends only on its world cell (`x + offsetX`, `y + offsetY`,
 * `z + offsetZ`) and the other options, never on the map's size. Chunks of any
 * size, created with the same options and their world origin as the offset,
 * agree bit for bit wherever they overlap.
 *
 * As in 2D, the mapping to [0, 1] is fixed by the options rather than stretched
 * per map, which keeps chunks consistent at the cost of contrast. 3D noise
 * spreads less than 2D: with the defaults a 48³ map spans roughly 0.23–0.78, and
 * a single octave roughly 0.15–0.88.
 *
 * Each cell costs `octaves` calls to `sample3`, which blends eight corners, so a
 * cell costs about twice a 2D one and the total grows with the volume.
 *
 * Throws if the size is not a positive integer or an option breaks its contract
 * in {@link Perlin3dOptions}.
 */
export function create(
  width: number,
  height: number,
  depth: number,
  options: Partial<Perlin3dOptions> = {}
): Noise3D {
  const noise = Noise3D.create(width, height, depth);

  const config = { ...DEFAULT_PERLIN_3D_OPTIONS, ...options };
  validateOptions3(config);

  const values = Noise3D.getValues(noise);
  const invScale = 1 / config.scale;

  const [octaveOffsets, maxPossibleHeight] = getOctaveConfig(config);
  const invRange = 0.5 / maxPossibleHeight;

  let index = 0;
  for (let z = 0; z < depth; z++) {
    const worldZ = z + config.offsetZ;
    for (let y = 0; y < height; y++) {
      const worldY = y + config.offsetY;
      for (let x = 0; x < width; x++) {
        const worldX = x + config.offsetX;
        const value = samplePoint(worldX, worldY, worldZ, config, octaveOffsets, invScale);
        values[index++] = value * invRange + 0.5;
      }
    }
  }

  return noise;
}
