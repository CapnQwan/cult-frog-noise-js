import { describe, expect, it } from 'vitest';

import { Noise3D } from '../index.js';

describe('Noise3D', () => {
  it('should create a noise map', () => {
    const noise = Noise3D.create(10, 10, 10);
    expect(noise).toBeInstanceOf(Float32Array);
    expect(noise.length).toBe(10 * 10 * 10 + 3);
  });

  it('should store the width and height of the noise map', () => {
    const noise = Noise3D.create(5, 10, 20);
    expect(noise[0]).toBe(5);
    expect(noise[1]).toBe(10);
  });

  it('should set and get a value in the noise map', () => {
    const noise = Noise3D.create(5, 10, 20);
    Noise3D.set(noise, 2, 3, 4, 0.5);
    expect(Noise3D.get(noise, 2, 3, 4)).toBe(0.5);
  });

  it('should not overwrite the header or other cells when setting values', () => {
    const noise = Noise3D.create(5, 10, 20);
    const id = (x: number, y: number, z: number) => (z * 10 + y) * 5 + x;
    Noise3D.forEach(noise, (_, x, y, z) => Noise3D.set(noise, x, y, z, id(x, y, z)));
    expect(noise[0]).toBe(5);
    expect(noise[1]).toBe(10);
    expect(noise[2]).toBe(20);
    Noise3D.forEach(noise, (value, x, y, z) => expect(value).toBe(id(x, y, z)));
  });

  it('should throw an error whilst creating a new noise map if the bounds are invalid', () => {
    expect(() => Noise3D.create(NaN, 3, 4)).toThrow('Invalid width, height, or depth');
    expect(() => Noise3D.create(2, -5, 4)).toThrow('Invalid width, height, or depth');
    expect(() => Noise3D.create(2, 3, Infinity)).toThrow('Invalid width, height, or depth');
    expect(() => Noise3D.create(2, -0, 1)).toThrow('Invalid width, height, or depth');
  });

  it('should throw an error whilst getting or setting a value if the bounds are invalid', () => {
    const noise = Noise3D.create(5, 10, 20);

    expect(() => Noise3D.set(noise, -2, 3, 4, 0.5)).toThrow('Invalid bounds');
    expect(() => Noise3D.set(noise, 20, 3, 4, 0.5)).toThrow('Invalid bounds');
    expect(() => Noise3D.set(noise, 3, NaN, 4, 0.5)).toThrow('Invalid x, y, or z');
    expect(() => Noise3D.set(noise, Infinity, 5, 4, 0.5)).toThrow('Invalid x, y, or z');

    expect(() => Noise3D.get(noise, -2, 3, 4)).toThrow('Invalid bounds');
    expect(() => Noise3D.get(noise, 20, 3, 4)).toThrow('Invalid bounds');
    expect(() => Noise3D.get(noise, 3, NaN, 4)).toThrow('Invalid x, y, or z');
    expect(() => Noise3D.get(noise, Infinity, 5, 4)).toThrow('Invalid x, y, or z');
  });

  it('should expose the cells x fastest, then y, then z, without the header', () => {
    const noise = Noise3D.create(5, 10, 20);
    const values = Noise3D.getValues(noise);
    expect(values.length).toBe(5 * 10 * 20);

    values[(4 * 10 + 3) * 5 + 2] = 0.25;
    expect(Noise3D.get(noise, 2, 3, 4)).toBe(0.25);

    Noise3D.set(noise, 4, 9, 19, 0.75);
    expect(values[(19 * 10 + 9) * 5 + 4]).toBe(0.75);
  });
});
