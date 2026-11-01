import type { Noise2D, Noise3D } from '../../../src/noiseMap/index.js';

export interface Param {
  key: string;
  label: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

interface Base {
  id: string;
  label: string;
  params: Param[];
}

export interface Generator2D extends Base {
  dims: 2;
  create(width: number, height: number, params: Record<string, number>): Noise2D;
}

export interface Generator3D extends Base {
  dims: 3;
  create(width: number, height: number, depth: number, params: Record<string, number>): Noise3D;
}

export type Generator = Generator2D | Generator3D;
