import { describe, expect, it } from 'vitest';

import { DEFAULT_PERLIN_2D_OPTIONS, DEFAULT_PERLIN_3D_OPTIONS } from '../defaultOptions.js';
import { validateOptions2, validateOptions3 } from '../options.js';

import type { Perlin2dOptions, Perlin3dOptions } from '../_types/options.js';

const options2 = (overrides: Partial<Perlin2dOptions>): Perlin2dOptions => ({
  ...DEFAULT_PERLIN_2D_OPTIONS,
  ...overrides,
});

const options3 = (overrides: Partial<Perlin3dOptions>): Perlin3dOptions => ({
  ...DEFAULT_PERLIN_3D_OPTIONS,
  ...overrides,
});

/**
 * The error `validate` throws. Messages are compared exactly because several
 * share a prefix ('Invalid scale' and 'Invalid scale, lacunarity, or octaves'),
 * so a substring match would accept the wrong check.
 */
function getError(validate: () => void): unknown {
  try {
    validate();
  } catch (error) {
    return error;
  }
  throw new Error('Expected validation to throw');
}

function expectRangeError(validate: () => void, message: string): void {
  const error = getError(validate);
  expect(error).toBeInstanceOf(RangeError);
  expect((error as RangeError).message).toBe(message);
}

describe('perlin/options', () => {
  describe('validateOptions2', () => {
    it.each<Partial<Perlin2dOptions>>([
      {},
      { octaves: 1 },
      { octaves: 32 },
      { persistence: 0 },
      { persistence: 1 },
      { offsetX: Number.MAX_SAFE_INTEGER, offsetY: Number.MIN_SAFE_INTEGER },
      { octaves: 32, lacunarity: 2.8e9 },
      { octaves: 32, lacunarity: 0.1, scale: 1e-6 },
      { octaves: 1, scale: 1e-290 },
    ])('should accept %o', (overrides) => {
      expect(() => validateOptions2(options2(overrides))).not.toThrow();
    });

    it.each<[Partial<Perlin2dOptions>, string]>([
      [{ seed: 1.5 }, 'Invalid seed'],
      [{ seed: Number.NaN }, 'Invalid seed'],
      [{ offsetX: 0.5 }, 'Invalid offsetX or offsetY'],
      [{ offsetY: 0.5 }, 'Invalid offsetX or offsetY'],
      [{ offsetX: Number.NaN }, 'Invalid offsetX or offsetY'],
      [{ offsetX: 2 ** 53 }, 'Invalid offsetX or offsetY'],
      [{ offsetY: -(2 ** 53) }, 'Invalid offsetX or offsetY'],
      [{ octaves: 0 }, 'Invalid octaves'],
      [{ octaves: 2.5 }, 'Invalid octaves'],
      [{ octaves: Number.NaN }, 'Invalid octaves'],
      [{ octaves: Number.POSITIVE_INFINITY }, 'Invalid octaves'],
      [{ octaves: 33 }, 'Invalid octaves'],
      [{ lacunarity: 0 }, 'Invalid lacunarity'],
      [{ lacunarity: -1 }, 'Invalid lacunarity'],
      [{ lacunarity: Number.NaN }, 'Invalid lacunarity'],
      [{ lacunarity: Number.POSITIVE_INFINITY }, 'Invalid lacunarity'],
      [{ persistence: -0.1 }, 'Invalid persistence'],
      [{ persistence: 1.1 }, 'Invalid persistence'],
      [{ persistence: Number.NaN }, 'Invalid persistence'],
      [{ scale: 0 }, 'Invalid scale'],
      [{ scale: -1 }, 'Invalid scale'],
      [{ scale: Number.NaN }, 'Invalid scale'],
      [{ scale: Number.POSITIVE_INFINITY }, 'Invalid scale'],
      [{ lacunarity: 1e300, octaves: 3 }, 'Invalid scale, lacunarity, or octaves'],
      [{ lacunarity: 3e9, octaves: 32 }, 'Invalid scale, lacunarity, or octaves'],
      [{ scale: 1e-292, octaves: 1 }, 'Invalid scale, lacunarity, or octaves'],
    ])('should throw a RangeError for %o', (overrides, message) => {
      expectRangeError(() => validateOptions2(options2(overrides)), message);
    });
  });

  describe('validateOptions3', () => {
    it.each<Partial<Perlin3dOptions>>([
      {},
      { offsetZ: Number.MAX_SAFE_INTEGER },
      { offsetZ: Number.MIN_SAFE_INTEGER },
    ])('should accept %o', (overrides) => {
      expect(() => validateOptions3(options3(overrides))).not.toThrow();
    });

    it.each<[Partial<Perlin3dOptions>, string]>([
      [{ octaves: 33 }, 'Invalid octaves'],
      [{ offsetZ: 0.5 }, 'Invalid offsetZ'],
      [{ offsetZ: Number.NaN }, 'Invalid offsetZ'],
      [{ offsetZ: 2 ** 53 }, 'Invalid offsetZ'],
    ])('should throw a RangeError for %o', (overrides, message) => {
      expectRangeError(() => validateOptions3(options3(overrides)), message);
    });
  });
});
