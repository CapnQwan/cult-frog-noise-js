export interface Noise2dOptions {
  /** The seed for the noise generator. */
  seed: number;
  /** The offset in the x-direction as an integer. */
  offsetX: number;
  /** The offset in the y-direction as an integer. */
  offsetY: number;
}

export interface Noise3dOptions extends Noise2dOptions {
  /** The offset in the z-direction as an integer. */
  offsetZ: number;
}
