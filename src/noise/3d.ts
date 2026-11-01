import { Hashes } from '../hashes/index.js';
import { Noise3D } from '../noiseMap/index.js';
import { DEFAULT_NOISE_3D_OPTIONS } from './defaultOptions.js';

import type { Noise3dOptions } from './_types/options.js';

export function create(
  width: number,
  height: number,
  depth: number,
  options: Partial<Noise3dOptions> = {}
): Noise3D {
  if (!(Number.isInteger(width) && Number.isInteger(height) && Number.isInteger(depth)))
    throw new Error('Invalid width, height, or depth');
  if (width <= 0 || height <= 0 || depth <= 0) throw new Error('Invalid width, height, or depth');

  const config = { ...DEFAULT_NOISE_3D_OPTIONS, ...options };

  if (
    !(
      Number.isInteger(config.offsetX) &&
      Number.isInteger(config.offsetY) &&
      Number.isInteger(config.offsetZ)
    )
  )
    throw new Error('Invalid offsetX or offsetY');

  const noise = Noise3D.create(width, height, depth);
  const seed = config.seed;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const hash = Hashes.hash3(x + config.offsetX, y + config.offsetY, z + config.offsetZ, seed);
        const value = (hash >>> 8) / 16777216;
        Noise3D.set(noise, x, y, z, value);
      }
    }
  }

  return noise;
}
