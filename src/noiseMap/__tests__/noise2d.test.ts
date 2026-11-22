import { describe, expect, it } from 'vitest';

import { Noise2D } from '../index.js';

describe('Noise2D', () => {
  it('should create a noise map', () => {
    const noise = Noise2D.create(10, 10);
    expect(noise).toBeInstanceOf(Float32Array);
    expect(noise.length).toBe(10 * 10 + 2);
  });

  it('should store the width and height of the noise map', () => {
    const noise = Noise2D.create(5, 10);
    expect(noise[0]).toBe(5);
    expect(noise[1]).toBe(10);
  });

  it('should set and get a value in the noise map', () => {
    const noise = Noise2D.create(5, 10);
    Noise2D.set(noise, 2, 3, 0.5);
    expect(Noise2D.get(noise, 2, 3)).toBe(0.5);
  });

  it('should not overwrite the header or other cells when setting values', () => {
    const noise = Noise2D.create(5, 10);
    Noise2D.forEach(noise, (_, x, y) => Noise2D.set(noise, x, y, y * 5 + x));
    expect(noise[0]).toBe(5);
    expect(noise[1]).toBe(10);
    Noise2D.forEach(noise, (value, x, y) => expect(value).toBe(y * 5 + x));
  });

  it('should expose the cells row-major without the header', () => {
    const noise = Noise2D.create(5, 10);
    const values = Noise2D.getValues(noise);
    expect(values.length).toBe(5 * 10);

    values[3 * 5 + 2] = 0.25;
    expect(Noise2D.get(noise, 2, 3)).toBe(0.25);

    Noise2D.set(noise, 4, 9, 0.75);
    expect(values[9 * 5 + 4]).toBe(0.75);
  });
});
