import type { Param } from './types.js';

export const SEED: Param = { key: 'seed', label: 'Seed', default: 0, step: 1 };
export const OFFSET_X: Param = { key: 'offsetX', label: 'Offset X', default: 0, step: 1 };
export const OFFSET_Y: Param = { key: 'offsetY', label: 'Offset Y', default: 0, step: 1 };
export const OFFSET_Z: Param = { key: 'offsetZ', label: 'Offset Z', default: 0, step: 1 };

export const FRACTAL: Param[] = [
  { key: 'scale', label: 'Scale', default: 1, min: 0.001, step: 0.1 },
  { key: 'octaves', label: 'Octaves', default: 1, min: 1, max: 12, step: 1 },
  { key: 'persistence', label: 'Persistence', default: 0.5, min: 0, max: 1, step: 0.05 },
  { key: 'lacunarity', label: 'Lacunarity', default: 2, min: 1, step: 0.1 },
];
