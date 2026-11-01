import type { Noise2dOptions, Noise3dOptions } from './_types/options.js';

export const DEFAULT_NOISE_2D_OPTIONS: Noise2dOptions = {
  seed: 0,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_NOISE_3D_OPTIONS: Noise3dOptions = {
  ...DEFAULT_NOISE_2D_OPTIONS,
  offsetZ: 0,
};
