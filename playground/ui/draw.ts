import { Noise3D } from '../../src/noiseMap/index.js';
import { settings } from '../noise/settings.js';
import { StatsAccumulator } from '../noise/stats.js';
import { getView } from '../noise/view.js';
import { els } from './dom.js';
import { showError } from './error.js';
import { renderStats } from './statsPanel.js';

import type { Stats } from '../noise/stats.js';

const ctx = els.canvas.getContext('2d') as CanvasRenderingContext2D;

function layerStats(noise: Noise3D, z: number): Stats {
  const acc = new StatsAccumulator();
  const w = Noise3D.width(noise);
  const h = Noise3D.height(noise);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) acc.add(Noise3D.get(noise, x, y, z));
  }
  return acc.result();
}

export function draw(): void {
  const view = getView();
  if (!view) {
    els.canvas.width = 0;
    els.canvas.height = 0;
    renderStats(undefined, undefined);
    return;
  }

  if (view.dims === 2) {
    paint(view.frame);
    renderStats(view.stats, undefined);
    return;
  }

  const z = els.layer.valueAsNumber;
  const frame = view.frames[z];
  if (!frame) return;
  paint(frame);
  els.layerLabel.textContent = `z ${z} / ${view.frames.length - 1}`;

  let stats = view.layerStats[z];
  if (!stats) {
    try {
      stats = layerStats(view.noise, z);
      view.layerStats[z] = stats;
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }
  renderStats(stats, view.volumeStats);
}

function paint(frame: ImageData): void {
  if (els.canvas.width !== frame.width || els.canvas.height !== frame.height) {
    els.canvas.width = frame.width;
    els.canvas.height = frame.height;
    applyZoom();
  }
  ctx.putImageData(frame, 0, 0);
}

export function applyZoom(): void {
  els.canvas.style.width = `${els.canvas.width * settings.zoom}px`;
  els.canvas.style.height = `${els.canvas.height * settings.zoom}px`;
}
