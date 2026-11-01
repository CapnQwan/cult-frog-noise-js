import { lowbias32 } from './lowbias.js';

const SEED_MUL = 0xc2b2ae3d;

const X_MUL = 0x9e3779b1;
const Y_MUL = 0x85ebca77;
const Z_MUL = 0x165667b1;

const INIT = 0x27d4eb2f;

export function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(seed | 0, SEED_MUL) ^ INIT;
  h = lowbias32(h ^ Math.imul(x | 0, X_MUL));
  h = lowbias32(h ^ Math.imul(y | 0, Y_MUL));
  return h;
}

export function hash3(x: number, y: number, z: number, seed: number): number {
  let h = Math.imul(seed | 0, SEED_MUL) ^ INIT;
  h = lowbias32(h ^ Math.imul(x | 0, X_MUL));
  h = lowbias32(h ^ Math.imul(y | 0, Y_MUL));
  h = lowbias32(h ^ Math.imul(z | 0, Z_MUL));
  return h;
}
