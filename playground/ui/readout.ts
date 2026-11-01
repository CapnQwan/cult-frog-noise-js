import { Noise2D, Noise3D } from '../../src/noiseMap/index.js';
import { fmt } from '../helpers/format.js';
import { settings } from '../noise/settings.js';
import { getView } from '../noise/view.js';
import { els } from './dom.js';

export function initReadout(): void {
  els.canvas.addEventListener('mousemove', (e) => {
    const view = getView();
    if (!view) return;
    const x = Math.floor(e.offsetX / settings.zoom);
    const y = Math.floor(e.offsetY / settings.zoom);
    try {
      if (view.dims === 2) {
        els.readout.textContent = `x ${x}  y ${y}  →  ${fmt(Noise2D.get(view.noise, x, y), 6)}`;
      } else {
        const z = els.layer.valueAsNumber;
        const value = Noise3D.get(view.noise, x, y, z);
        els.readout.textContent = `x ${x}  y ${y}  z ${z}  →  ${fmt(value, 6)}`;
      }
    } catch {
      // cursor on the canvas edge can land one pixel out of bounds
    }
  });

  els.canvas.addEventListener('mouseleave', () => {
    els.readout.textContent = 'Hover the image to inspect values';
  });
}
