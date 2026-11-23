import { Random } from '@cult-frog/random';
import { describe, expect, it } from 'vitest';

import { corner3, sample3 } from '../sample3.js';

/** Offsets chosen so all twelve gradient dot products are distinct values. */
const DX = 1;
const DY = 10;
const DZ = 100;
const GRADIENT_DOTS = [
  DX + DY,
  -DX + DY,
  DX - DY,
  -DX - DY,
  DX + DZ,
  -DX + DZ,
  DX - DZ,
  -DX - DZ,
  DY + DZ,
  -DY + DZ,
  DY - DZ,
  -DY - DZ,
];

/** Min and max of `sample3` over `count` seeded random points, so every run sees the same inputs. */
function sampleRange(count: number, noiseSeed: number): [number, number] {
  const rng = new Random(1);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < count; i++) {
    const value = sample3(
      rng.float(-10_000, 10_000),
      rng.float(-10_000, 10_000),
      rng.float(-10_000, 10_000),
      noiseSeed
    );
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return [min, max];
}

describe('perlin/sample3', () => {
  describe('corner3', () => {
    it('should return the dot product with one of the twelve gradients', () => {
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            expect(GRADIENT_DOTS).toContain(corner3(x, y, z, DX, DY, DZ, 0));
          }
        }
      }
    });

    it('should pick each gradient about equally often', () => {
      const size = 32;
      const counts = new Array<number>(GRADIENT_DOTS.length).fill(0);
      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const bucket = GRADIENT_DOTS.indexOf(corner3(x, y, z, DX, DY, DZ, 0));
            counts[bucket] = (counts[bucket] ?? 0) + 1;
          }
        }
      }

      const expected = size ** 3 / GRADIENT_DOTS.length;
      for (const count of counts) {
        expect(count).toBeGreaterThan(expected * 0.9);
        expect(count).toBeLessThan(expected * 1.1);
      }
    });

    it('should depend on the seed', () => {
      let differing = 0;
      for (let x = 0; x < 64; x++) {
        if (corner3(x, 0, 0, DX, DY, DZ, 0) !== corner3(x, 0, 0, DX, DY, DZ, 1)) differing++;
      }
      expect(differing).toBeGreaterThan(32);
    });
  });

  describe('sample3', () => {
    it('should be zero at every lattice point', () => {
      for (let z = -10; z <= 10; z++) {
        for (let y = -10; y <= 10; y++) {
          for (let x = -10; x <= 10; x++) {
            expect(Math.abs(sample3(x, y, z, 0))).toBe(0);
          }
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
      expect(min).toBeLessThan(-0.8);
      expect(max).toBeGreaterThan(0.8);
    });

    it('should be continuous across cell borders on every axis', () => {
      const epsilon = 1e-9;
      for (let k = -100; k < 100; k++) {
        for (const other of [0.3, 17.7]) {
          const jumpX = sample3(k - epsilon, other, 0.6, 3) - sample3(k + epsilon, other, 0.6, 3);
          const jumpY = sample3(other, k - epsilon, 0.6, 3) - sample3(other, k + epsilon, 0.6, 3);
          const jumpZ = sample3(other, 0.6, k - epsilon, 3) - sample3(other, 0.6, k + epsilon, 3);
          expect(Math.abs(jumpX)).toBeLessThan(1e-6);
          expect(Math.abs(jumpY)).toBeLessThan(1e-6);
          expect(Math.abs(jumpZ)).toBeLessThan(1e-6);
        }
      }
    });

    it('should return the same value for the same point and seed', () => {
      expect(sample3(12.34, -56.78, 9.01, 9)).toBe(sample3(12.34, -56.78, 9.01, 9));
    });

    it('should produce different noise for different seeds', () => {
      let differing = 0;
      for (let i = 0; i < 64; i++) {
        const x = i * 0.37 + 0.11;
        if (sample3(x, 0.5, 0.25, 0) !== sample3(x, 0.5, 0.25, 1)) differing++;
      }
      expect(differing).toBeGreaterThan(56);
    });

    /**
     * Pins the exact output for fixed inputs. Seeded noise promises the same
     * world for the same seed, so any change to these values breaks every
     * caller's existing seeds and must be deliberate.
     */
    it('should match the golden values', () => {
      expect(sample3(3.25, 7.75, 1.5, 0)).toBe(-0.5207593207836151);
      expect(sample3(-12.4, 5.6, 0.3, 1)).toBe(-0.15342814467294694);
      expect(sample3(1000.1, -2000.3, 55.5, 42)).toBe(-0.34978740547911186);

      let sum = 0;
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            sum += sample3(x * 0.37 + 0.11, y * 0.29 + 0.07, z * 0.23 + 0.05, 7);
          }
        }
      }
      expect(sum).toBe(-33.810706116301475);
    });
  });
});
