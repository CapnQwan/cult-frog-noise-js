import { Random } from '@cult-frog/random';
import { describe, expect, it } from 'vitest';

import { corner2, sample2 } from '../sample2.js';

/** Offsets chosen so all eight gradient dot products are distinct values. */
const DX = 1;
const DY = 10;
const GRADIENT_DOTS = [DX, -DX, DY, -DY, DX + DY, DX - DY, -DX + DY, -DX - DY];

/** Min and max of `sample2` over `count` seeded random points, so every run sees the same inputs. */
function sampleRange(count: number, noiseSeed: number): [number, number] {
  const rng = new Random(1);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < count; i++) {
    const value = sample2(rng.float(-10_000, 10_000), rng.float(-10_000, 10_000), noiseSeed);
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return [min, max];
}

describe('perlin/hash', () => {
  describe('corner2', () => {
    it('should return the dot product with one of the eight gradients', () => {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          expect(GRADIENT_DOTS).toContain(corner2(x, y, DX, DY, 0));
        }
      }
    });

    it('should pick each gradient about equally often', () => {
      const size = 128;
      const counts = new Array<number>(GRADIENT_DOTS.length).fill(0);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const bucket = GRADIENT_DOTS.indexOf(corner2(x, y, DX, DY, 0));
          counts[bucket] = (counts[bucket] ?? 0) + 1;
        }
      }

      const expected = (size * size) / GRADIENT_DOTS.length;
      for (const count of counts) {
        expect(count).toBeGreaterThan(expected * 0.9);
        expect(count).toBeLessThan(expected * 1.1);
      }
    });

    it('should depend on the seed', () => {
      let differing = 0;
      for (let x = 0; x < 64; x++) {
        if (corner2(x, 0, DX, DY, 0) !== corner2(x, 0, DX, DY, 1)) differing++;
      }
      expect(differing).toBeGreaterThan(32);
    });
  });

  describe('sample2', () => {
    it('should be zero at every lattice point', () => {
      for (let y = -50; y <= 50; y++) {
        for (let x = -50; x <= 50; x++) {
          expect(Math.abs(sample2(x, y, 0))).toBe(0);
        }
      }
    });

    it('should stay within [-1, 1]', () => {
      const [min, max] = sampleRange(100_000, 0);
      expect(min).toBeGreaterThanOrEqual(-1);
      expect(max).toBeLessThanOrEqual(1);
    });

    it('should use most of the [-1, 1] range', () => {
      const [min, max] = sampleRange(100_000, 0);
      expect(min).toBeLessThan(-0.9);
      expect(max).toBeGreaterThan(0.9);
    });

    it('should be continuous across cell borders', () => {
      const epsilon = 1e-9;
      for (let k = -500; k < 500; k++) {
        for (const other of [0.3, 17.7]) {
          expect(
            Math.abs(sample2(k - epsilon, other, 3) - sample2(k + epsilon, other, 3))
          ).toBeLessThan(1e-6);
          expect(
            Math.abs(sample2(other, k - epsilon, 3) - sample2(other, k + epsilon, 3))
          ).toBeLessThan(1e-6);
        }
      }
    });

    it('should return the same value for the same point and seed', () => {
      expect(sample2(12.34, -56.78, 9)).toBe(sample2(12.34, -56.78, 9));
    });

    it('should produce different noise for different seeds', () => {
      let differing = 0;
      for (let i = 0; i < 64; i++) {
        if (sample2(i * 0.37 + 0.11, 0.5, 0) !== sample2(i * 0.37 + 0.11, 0.5, 1)) differing++;
      }
      expect(differing).toBeGreaterThan(56);
    });

    /**
     * Pins the exact output for fixed inputs. Seeded noise promises the same
     * world for the same seed, so any change to these values breaks every
     * caller's existing seeds and must be deliberate.
     */
    it('should match the golden values', () => {
      expect(sample2(0.5, 0.5, 0)).toBe(0.125);
      expect(sample2(3.25, 7.75, 0)).toBe(0.26976871490478516);
      expect(sample2(-12.4, 5.6, 1)).toBe(0.3989183692799999);
      expect(sample2(1000.1, -2000.3, 42)).toBe(-0.3824881055999451);

      let sum = 0;
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) sum += sample2(x * 0.37 + 0.11, y * 0.29 + 0.07, 7);
      }
      expect(sum).toBe(3.6370903530022485);
    });
  });
});
