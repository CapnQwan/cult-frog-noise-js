import * as Noise2d from '../../../src/noise/2d.js';
import * as Noise3d from '../../../src/noise/3d.js';
import * as Perlin2d from '../../../src/perlin/2d.js';
import * as Perlin3d from '../../../src/perlin/3d.js';
import { FRACTAL, OFFSET_X, OFFSET_Y, OFFSET_Z, SEED } from './params.js';

import type { Generator } from './types.js';

/**
 * Generators the playground can render. Add an entry here when a new noise
 * function lands and it shows up in the dropdown with controls for its params.
 */

export const GENERATORS: Generator[] = [
  {
    id: 'white-noise-2d',
    label: 'White noise 2D',
    dims: 2,
    params: [SEED, OFFSET_X, OFFSET_Y],
    create: (width, height, params) => Noise2d.create(width, height, params),
  },
  {
    id: 'white-noise-3d',
    label: 'White noise 3D',
    dims: 3,
    params: [SEED, OFFSET_X, OFFSET_Y, OFFSET_Z],
    create: (width, height, depth, params) => Noise3d.create(width, height, depth, params),
  },
  {
    id: 'perlin-2d',
    label: 'Perlin 2D',
    dims: 2,
    params: [SEED, ...FRACTAL, OFFSET_X, OFFSET_Y],
    create: (width, height, params) => Perlin2d.create(width, height, params),
  },
  {
    id: 'perlin-3d',
    label: 'Perlin 3D',
    dims: 3,
    params: [SEED, ...FRACTAL, OFFSET_X, OFFSET_Y, OFFSET_Z],
    create: (width, height, depth, params) => Perlin3d.create(width, height, depth, params),
  },
];
