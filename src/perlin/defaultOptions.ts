import type { Perlin2dOptions, Perlin3dOptions } from './_types/options.js';

export const DEFAULT_PERLIN_2D_OPTIONS: Perlin2dOptions = {
  seed: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 20,
  lacunarity: 2,
  persistence: 0.5,
  octaves: 5,
};

export const DEFAULT_PERLIN_3D_OPTIONS: Perlin3dOptions = {
  ...DEFAULT_PERLIN_2D_OPTIONS,
  offsetZ: 0,
};
