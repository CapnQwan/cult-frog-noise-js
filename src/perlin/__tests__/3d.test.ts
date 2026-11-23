import { describe, expect, it } from 'vitest';

import { Noise3D } from '../../noiseMap/index.js';
import * as Perlin3D from '../3d.js';
import { DEFAULT_PERLIN_3D_OPTIONS } from '../defaultOptions.js';

import type { Perlin3dOptions } from '../_types/options.js';

function range(noise: Noise3D): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  Noise3D.forEach(noise, (value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  return [min, max];
}

function sum(noise: Noise3D): number {
  let total = 0;
  Noise3D.forEach(noise, (value) => {
    total += value;
  });
  return total;
}

/** Values of a `width` × `height` × `depth` box starting at (`left`, `top`, `front`), x fastest. */
function region(
  noise: Noise3D,
  [left, top, front]: [number, number, number],
  [width, height, depth]: [number, number, number]
) {
  const values: number[] = [];
  for (let z = front; z < front + depth; z++) {
    for (let y = top; y < top + height; y++) {
      for (let x = left; x < left + width; x++) values.push(Noise3D.get(noise, x, y, z));
    }
  }
  return values;
}

describe('perlin/3d', () => {
  describe('create', () => {
    it('should create a map with the requested size', () => {
      const noise = Perlin3D.create(12, 8, 4);
      expect(Noise3D.width(noise)).toBe(12);
      expect(Noise3D.height(noise)).toBe(8);
      expect(Noise3D.depth(noise)).toBe(4);
    });

    it.each<Partial<Perlin3dOptions>>([
      {},
      { octaves: 1 },
      { octaves: 8, persistence: 1, lacunarity: 3 },
      { persistence: 0 },
      { scale: 0.5 },
    ])('should keep every value within [0, 1] for %o', (options) => {
      const [min, max] = range(Perlin3D.create(24, 24, 24, options));
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(1);
    });

    it.each([0, 1, 2])('should centre values around 0.5 for seed %i', (seed) => {
      const noise = Perlin3D.create(48, 48, 48, { seed });
      expect(sum(noise) / 48 ** 3).toBeCloseTo(0.5, 1);
    });

    it('should use most of the range with a single octave', () => {
      const [min, max] = range(Perlin3D.create(48, 48, 48, { octaves: 1 }));
      expect(min).toBeLessThan(0.2);
      expect(max).toBeGreaterThan(0.8);
    });

    it('should use the default options when none are given', () => {
      expect(Perlin3D.create(12, 12, 12)).toEqual(
        Perlin3D.create(12, 12, 12, DEFAULT_PERLIN_3D_OPTIONS)
      );
    });

    it('should return the same map for the same seed', () => {
      expect(Perlin3D.create(12, 12, 12, { seed: 5 })).toEqual(
        Perlin3D.create(12, 12, 12, { seed: 5 })
      );
    });

    it('should return different maps for different seeds', () => {
      expect(Perlin3D.create(12, 12, 12, { seed: 5 })).not.toEqual(
        Perlin3D.create(12, 12, 12, { seed: 6 })
      );
    });

    it.each([0, 1_000_000])(
      'should give overlapping chunks the same values for the same world cells (base offset %i)',
      (base) => {
        const size = 16;
        const half = size / 2;
        const at = (dx: number, dy: number, dz: number) =>
          Perlin3D.create(size, size, size, {
            seed: 7,
            offsetX: base + dx,
            offsetY: base + dy,
            offsetZ: base + dz,
          });
        const origin = at(0, 0, 0);

        expect(region(at(half, 0, 0), [0, 0, 0], [half, size, size])).toEqual(
          region(origin, [half, 0, 0], [half, size, size])
        );
        expect(region(at(0, half, 0), [0, 0, 0], [size, half, size])).toEqual(
          region(origin, [0, half, 0], [size, half, size])
        );
        expect(region(at(0, 0, half), [0, 0, 0], [size, size, half])).toEqual(
          region(origin, [0, 0, half], [size, size, half])
        );
      }
    );

    it('should give maps of different sizes the same values for the same world cells', () => {
      const cube = Perlin3D.create(24, 24, 24, { seed: 7 });
      const slab = Perlin3D.create(32, 16, 12, { seed: 7, offsetX: 8, offsetY: 4, offsetZ: 6 });

      expect(region(slab, [0, 0, 0], [16, 16, 12])).toEqual(region(cube, [8, 4, 6], [16, 16, 12]));
    });

    it.each<Partial<Perlin3dOptions>>([
      { octaves: 32 },
      { octaves: 32, persistence: 1, lacunarity: 1e9 },
      { octaves: 32, lacunarity: 0.1, scale: 1e-6 },
      {
        offsetX: Number.MAX_SAFE_INTEGER - 4,
        offsetY: Number.MIN_SAFE_INTEGER,
        offsetZ: Number.MAX_SAFE_INTEGER - 4,
      },
    ])('should keep every value within [0, 1] at the accepted extreme %o', (options) => {
      const [min, max] = range(Perlin3D.create(4, 4, 4, options));
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(1);
    });

    it('should produce a value within [0, 1] for a 1×1×1 map', () => {
      const value = Noise3D.get(Perlin3D.create(1, 1, 1), 0, 0, 0);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    /**
     * Pins the exact output for fixed inputs. Seeded noise promises the same
     * world for the same seed, so any change to these values breaks every
     * caller's existing seeds and must be deliberate.
     */
    it('should match the golden values', () => {
      expect(sum(Perlin3D.create(16, 16, 16))).toBe(1849.3316076099873);
      expect(
        sum(
          Perlin3D.create(12, 12, 12, {
            seed: 3,
            octaves: 3,
            offsetX: 100,
            offsetY: -40,
            offsetZ: 7,
          })
        )
      ).toBe(1009.5051483511925);
    });

    it.each([
      [0, 4, 4],
      [4, 0, 4],
      [4, 4, 0],
      [-1, 4, 4],
      [4, 4, -1],
      [1.5, 4, 4],
      [4, 4, 1.5],
    ])('should throw for an invalid size of %s × %s × %s', (width, height, depth) => {
      expect(() => Perlin3D.create(width, height, depth)).toThrow('Invalid width');
    });

    it('should validate the options before sampling', () => {
      expect(() => Perlin3D.create(4, 4, 4, { octaves: 0 })).toThrow(RangeError);
    });
  });
});
