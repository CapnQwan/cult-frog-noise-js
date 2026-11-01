import type { Brand } from '@cult-frog/types';

/**
 * A typed array buffer holding values for a 3D noise map.
 *
 * @example [width, height, depth, value, value, value, value, value, value, ...]
 */
export type Noise3D = Brand<Float32Array, 'Noise3D'> & {
  /** width */
  0: number;
  /** height */
  1: number;
  /** depth */
  2: number;
};
