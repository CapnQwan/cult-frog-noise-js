import type { Brand } from '@cult-frog/types';

/**
 * A typed array buffer holding values for a 2D noise map.
 *
 * @example [width, height, value, value, value, value, ...]
 */
export type Noise2D = Brand<Float32Array, 'Noise2D'> & {
  /** width */
  0: number;
  /** height */
  1: number;
};
