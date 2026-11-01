import type { Noise2D, Noise3D } from '../../src/noiseMap/index.js';
import type { Stats } from './stats.js';

/** The most recently generated noise, plus everything derived from it for display. */
export type View =
  | { dims: 2; noise: Noise2D; frame: ImageData; stats: Stats }
  | {
      dims: 3;
      noise: Noise3D;
      frames: ImageData[];
      layerStats: (Stats | undefined)[];
      volumeStats: Stats;
    };

let view: View | undefined;

export function getView(): View | undefined {
  return view;
}

export function setView(next: View | undefined): void {
  view = next;
}
