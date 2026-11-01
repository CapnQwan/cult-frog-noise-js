import type { Noise3D } from './_types/noise3d.js';

const HEADER_LENGTH = 3;

function validateBounds(noise: Noise3D, x: number, y: number, z: number): void {
  const [width, height, depth] = noise;
  if (!(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z)))
    throw new Error('Invalid x, y, or z');
  if (x < 0 || x >= width || y < 0 || y >= height || z < 0 || z >= depth)
    throw new Error('Invalid bounds');
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
    throw new Error('Invalid width, height, or depth');
  if (width <= 0 || height <= 0 || depth <= 0) throw new Error('Invalid width, height, or depth');
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
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
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
