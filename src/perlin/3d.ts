import { Random } from '@cult-frog/random';

import { Noise3D } from '../noiseMap/index.js';

import type { Perlin2dOptions } from './_types/options.js';

export function create(
  width: number,
  height: number,
  depth: number,
  options: Partial<Perlin2dOptions> = {}
): Noise3D {
  const noise = Noise3D.create(width, height, depth);
  const _prng = new Random(options.seed);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        Noise3D.set(noise, x, y, z, Math.random());
      }
    }
  }

  return noise;
}
