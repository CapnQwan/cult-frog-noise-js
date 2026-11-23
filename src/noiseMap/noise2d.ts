import type { Noise2D } from './_types/noise2d.js';

const HEADER_LENGTH = 2;

function validateBounds(noise: Noise2D, x: number, y: number): void {
  const [width, height] = noise;
  if (!(Number.isInteger(x) && Number.isInteger(y))) throw new RangeError('Invalid x or y');
  if (x < 0 || x >= width || y < 0 || y >= height) throw new RangeError('Invalid bounds');
}

function getIndex(noise: Noise2D, x: number, y: number): number {
  /** @todo - should validation have an opt out? */
  validateBounds(noise, x, y);
  const [width] = noise;
  return y * width + x + HEADER_LENGTH;
}

export function create(width: number, height: number): Noise2D {
  if (!(Number.isInteger(width) && Number.isInteger(height)))
    throw new RangeError('Invalid width or height');
  if (width <= 0 || height <= 0) throw new RangeError('Invalid width or height');

  const noise = new Float32Array(width * height + HEADER_LENGTH) as Noise2D;
  noise[0] = width;
  noise[1] = height;
  return noise;
}

export function getWidth(noise: Noise2D): number {
  return noise[0];
}

export function getHeight(noise: Noise2D): number {
  return noise[1];
}

/**
 * The map's cells as a row-major view over the same buffer, without the header:
 * cell (x, y) is at `y * width + x`. Writes through it change the map, and it
 * stays valid as long as the map does. There are no bounds checks, unlike
 * `get`/`set`, so it suits whole-map passes whose loops already stay in range.
 * Each call allocates a small view object, so take it once per pass, not per cell.
 */
export function getValues(noise: Noise2D): Float32Array {
  return noise.subarray(HEADER_LENGTH);
}

export function set(noise: Noise2D, x: number, y: number, value: number): void {
  noise[getIndex(noise, x, y)] = value;
}

export function get(noise: Noise2D, x: number, y: number): number {
  return noise[getIndex(noise, x, y)] as number;
}

export function forEach(
  noise: Noise2D,
  callback: (value: number, x: number, y: number) => void
): void {
  const [width, height] = noise;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      callback(get(noise, x, y), x, y);
    }
  }
}

export function toPixelBuffer(noise: Noise2D): Uint8Array {
  const [width, height] = noise;
  const pixelBuffer = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = get(noise, x, y);
      pixelBuffer[index] = value * 255;
      pixelBuffer[index + 1] = value * 255;
      pixelBuffer[index + 2] = value * 255;
      pixelBuffer[index + 3] = 255;
    }
  }
  return pixelBuffer;
}
