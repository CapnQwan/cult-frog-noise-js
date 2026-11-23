/**
 * Options for 2D Perlin noise. A map is a pure function of its size and these
 * options, so the same options reproduce it exactly on any JS engine.
 *
 * Besides each field's own contract, `scale`, `lacunarity` and `octaves` are
 * rejected together when the finest octave's frequency is so high that sample
 * coordinates would overflow. That takes extreme values (lacunarity 2 stays far
 * inside the limit even at 32 octaves), and the check does not depend on the
 * offsets, so options that work for one chunk work for every chunk.
 */
export interface Perlin2dOptions {
  /**
   * Integer. Selects the lattice gradients and each octave's offset. Gradient
   * selection only sees the low 32 bits, so seeds 2^32 apart share gradients but
   * not octave offsets.
   */
  seed: number;
  /**
   * Width of one lattice cell of the first octave, in map cells. Larger values
   * zoom in. Finite and greater than 0.
   */
  scale: number;
  /**
   * Frequency multiplier from one octave to the next; 2 halves the feature size
   * each octave. Finite and greater than 0.
   */
  lacunarity: number;
  /**
   * Amplitude multiplier from one octave to the next, in [0, 1]. Output is scaled
   * by the sum of all amplitudes, so raising this or adding octaves narrows the
   * spread of values around 0.5.
   */
  persistence: number;
  /** Number of layers summed. Integer in [1, 32]. Cost grows linearly with it. */
  octaves: number;
  /**
   * World x of the map's first column, in map cells. A safe integer (|v| < 2^53),
   * so `x + offsetX` is exact and a chunk at offset 64 reproduces column 64 of a
   * chunk at offset 0 bit for bit. Larger integers would round when added to.
   */
  offsetX: number;
  /** World y of the map's first row. Same contract as {@link offsetX}. */
  offsetY: number;
}

/** Options for 3D Perlin noise: the 2D options plus a z offset. */
export interface Perlin3dOptions extends Perlin2dOptions {
  /** World z of the map's first layer. Same contract as {@link Perlin2dOptions.offsetX}. */
  offsetZ: number;
}
