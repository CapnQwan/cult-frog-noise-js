import { describe, expect, it } from 'vitest';

import { Noise2D } from '../../noiseMap/index.js';
import * as Perlin2D from '../2d.js';
import { DEFAULT_PERLIN_2D_OPTIONS } from '../defaultOptions.js';

import type { Perlin2dOptions } from '../_types/options.js';

function range(noise: Noise2D): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  Noise2D.forEach(noise, (value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  return [min, max];
}

function sum(noise: Noise2D): number {
  let total = 0;
  Noise2D.forEach(noise, (value) => {
    total += value;
  });
  return total;
}

/** Values of a `width` × `height` window starting at (`left`, `top`), row by row. */
function region(noise: Noise2D, left: number, top: number, width: number, height: number) {
  const values: number[] = [];
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) values.push(Noise2D.get(noise, x, y));
  }
  return values;
}

describe('perlin/2d', () => {
  describe('create', () => {
    it('should create a map with the requested size', () => {
      const noise = Perlin2D.create(24, 16);
      expect(Noise2D.getWidth(noise)).toBe(24);
      expect(Noise2D.getHeight(noise)).toBe(16);
    });

    it.each<Partial<Perlin2dOptions>>([
      {},
      { octaves: 1 },
      { octaves: 8, persistence: 1, lacunarity: 3 },
      { persistence: 0 },
      { scale: 0.5 },
    ])('should keep every value within [0, 1] for %o', (options) => {
      const [min, max] = range(Perlin2D.create(64, 64, options));
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(1);
    });

    it.each([0, 1, 2])('should centre values around 0.5 for seed %i', (seed) => {
      const noise = Perlin2D.create(256, 256, { seed });
      expect(sum(noise) / (256 * 256)).toBeCloseTo(0.5, 1);
    });

    it('should use most of the range with a single octave', () => {
      const [min, max] = range(Perlin2D.create(256, 256, { octaves: 1 }));
      expect(min).toBeLessThan(0.2);
      expect(max).toBeGreaterThan(0.8);
    });

    it('should use the default options when none are given', () => {
      expect(Perlin2D.create(32, 32)).toEqual(Perlin2D.create(32, 32, DEFAULT_PERLIN_2D_OPTIONS));
    });

    it('should return the same map for the same seed', () => {
      expect(Perlin2D.create(32, 32, { seed: 5 })).toEqual(Perlin2D.create(32, 32, { seed: 5 }));
    });

    it('should return different maps for different seeds', () => {
      expect(Perlin2D.create(32, 32, { seed: 5 })).not.toEqual(
        Perlin2D.create(32, 32, { seed: 6 })
      );
    });

    it.each([0, 1_000_000])(
      'should give overlapping chunks the same values for the same world cells (base offset %i)',
      (base) => {
        const size = 64;
        const half = size / 2;
        const origin = Perlin2D.create(size, size, { seed: 7, offsetX: base, offsetY: base });
        const right = Perlin2D.create(size, size, { seed: 7, offsetX: base + half, offsetY: base });
        const below = Perlin2D.create(size, size, { seed: 7, offsetX: base, offsetY: base + half });

        expect(region(right, 0, 0, half, size)).toEqual(region(origin, half, 0, half, size));
        expect(region(below, 0, 0, size, half)).toEqual(region(origin, 0, half, size, half));
      }
    );

    it('should give maps of different sizes the same values for the same world cells', () => {
      const square = Perlin2D.create(64, 64, { seed: 7 });
      const wide = Perlin2D.create(96, 40, { seed: 7, offsetX: 16, offsetY: 8 });

      expect(region(wide, 0, 0, 48, 40)).toEqual(region(square, 16, 8, 48, 40));
    });

    it.each<Partial<Perlin2dOptions>>([
      { octaves: 32 },
      { octaves: 32, persistence: 1, lacunarity: 1e9 },
      { octaves: 32, lacunarity: 0.1, scale: 1e-6 },
      { offsetX: Number.MAX_SAFE_INTEGER - 8, offsetY: Number.MIN_SAFE_INTEGER },
    ])('should keep every value within [0, 1] at the accepted extreme %o', (options) => {
      const [min, max] = range(Perlin2D.create(8, 8, options));
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(1);
    });

    it('should produce a value within [0, 1] for a 1×1 map', () => {
      const value = Noise2D.get(Perlin2D.create(1, 1), 0, 0);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    /**
     * Pins the exact output for fixed inputs. Seeded noise promises the same
     * world for the same seed, so any change to these values breaks every
     * caller's existing seeds and must be deliberate.
     */
    it('should match the golden values', () => {
      expect(sum(Perlin2D.create(64, 64))).toBe(2019.1209484934807);
      expect(
        sum(Perlin2D.create(32, 32, { seed: 3, octaves: 3, offsetX: 100, offsetY: -40 }))
      ).toBe(511.91870445013046);
    });

    it.each([
      [0, 10],
      [10, 0],
      [-1, 10],
      [10, -1],
      [1.5, 10],
      [10, 1.5],
    ])('should throw for an invalid size of %s × %s', (width, height) => {
      expect(() => Perlin2D.create(width, height)).toThrow('Invalid width or height');
    });

    it('should validate the options before sampling', () => {
      expect(() => Perlin2D.create(8, 8, { octaves: 0 })).toThrow(RangeError);
    });
  });
});
