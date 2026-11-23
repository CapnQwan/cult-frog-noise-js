import type { Noise3D } from './_types/noise3d.js';

const HEADER_LENGTH = 3;

function validateBounds(noise: Noise3D, x: number, y: number, z: number): void {
  const [width, height, depth] = noise;
  if (!(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z)))
    throw new RangeError('Invalid x, y, or z');
  if (x < 0 || x >= width || y < 0 || y >= height || z < 0 || z >= depth)
    throw new RangeError('Invalid bounds');
}

function getIndex(noise: Noise3D, x: number, y: number, z: number): number {
  /** @todo - should validation have an opt out? */
  validateBounds(noise, x, y, z);
  const [width, height] = noise;
  // +3 skips the [width, height, depth] header
  return (z * height + y) * width + x + HEADER_LENGTH;
}

export function create(width: number, height: number, depth: number): Noise3D {
  if (!(Number.isInteger(width) && Number.isInteger(height) && Number.isInteger(depth)))
    throw new RangeError('Invalid width, height, or depth');
  if (width <= 0 || height <= 0 || depth <= 0)
    throw new RangeError('Invalid width, height, or depth');

  const noise = new Float32Array(width * height * depth + 3) as Noise3D;
  noise[0] = width;
  noise[1] = height;
  noise[2] = depth;
  return noise;
}

export function width(noise: Noise3D): number {
  return noise[0];
}

export function height(noise: Noise3D): number {
  return noise[1];
}

export function depth(noise: Noise3D): number {
  return noise[2];
}

/**
 * The map's cells as a view over the same buffer, without the header. x varies
 * fastest, then y, then z: cell (x, y, z) is at `(z * height + y) * width + x`.
 * Writes through it change the map, and it stays valid as long as the map does.
 * There are no bounds checks, unlike `get`/`set`, so it suits whole-map passes
 * whose loops already stay in range. Each call allocates a small view object, so
 * take it once per pass, not per cell.
 */
export function getValues(noise: Noise3D): Float32Array {
  return noise.subarray(HEADER_LENGTH);
}

export function set(noise: Noise3D, x: number, y: number, z: number, value: number): void {
  noise[getIndex(noise, x, y, z)] = value;
}

export function get(noise: Noise3D, x: number, y: number, z: number): number {
  return noise[getIndex(noise, x, y, z)] as number;
}

export function forEach(
  noise: Noise3D,
  callback: (value: number, x: number, y: number, z: number) => void
): void {
  const [width, height, depth] = noise;
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        callback(get(noise, x, y, z), x, y, z);
      }
    }
  }
}

export function toPixelBuffer(noise: Noise3D, layer: number): Uint8Array {
  const [width, height] = noise;
  const pixelBuffer = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = get(noise, x, y, layer);
      pixelBuffer[index] = value * 255;
      pixelBuffer[index + 1] = value * 255;
      pixelBuffer[index + 2] = value * 255;
      pixelBuffer[index + 3] = 255;
    }
  }
  return pixelBuffer;
}

export function toPixelBuffers(noise: Noise3D): Uint8Array[] {
  const [, , depth] = noise;
  const pixelBuffers: Uint8Array[] = [];
  for (let z = 0; z < depth; z++) {
    const pixelBuffer = toPixelBuffer(noise, z);
    pixelBuffers.push(pixelBuffer);
  }
  return pixelBuffers;
}
