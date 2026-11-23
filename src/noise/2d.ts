import { Hashes } from '../hashes/index.js';
import { Noise2D } from '../noiseMap/index.js';
import { DEFAULT_NOISE_2D_OPTIONS } from './defaultOptions.js';

import type { Noise2dOptions } from './_types/options.js';

export function create(
  width: number,
  height: number,
  options: Partial<Noise2dOptions> = {}
): Noise2D {
  const noise = Noise2D.create(width, height);

  const config = { ...DEFAULT_NOISE_2D_OPTIONS, ...options };

  if (!(Number.isInteger(config.offsetX) && Number.isInteger(config.offsetY)))
    throw new RangeError('Invalid offsetX or offsetY');

  const seed = config.seed;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hash = Hashes.hash2(x + config.offsetX, y + config.offsetY, seed);
      const value = (hash >>> 8) / 16777216;
      Noise2D.set(noise, x, y, value);
    }
  }

  return noise;
}
