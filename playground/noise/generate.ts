import { Noise2D, Noise3D } from '../../src/noiseMap/index.js';
import { els } from '../ui/dom.js';
import { draw } from '../ui/draw.js';
import { showError } from '../ui/error.js';
import { stopPlayback } from '../ui/playback.js';
import { renderTiming } from '../ui/timing.js';
import { currentGenerator, paramsFor, settings } from './settings.js';
import { StatsAccumulator } from './stats.js';
import { getView, setView } from './view.js';

let debounce = 0;

export function scheduleGenerate(): void {
  clearTimeout(debounce);
  debounce = window.setTimeout(generate, 150);
}

function toImageData(buffer: Uint8Array, width: number, height: number): ImageData {
  // toPixelBuffer returns a Uint8Array, ImageData wants Uint8ClampedArray over the same bytes.
  const clamped = new Uint8ClampedArray(
    buffer.buffer as ArrayBuffer,
    buffer.byteOffset,
    buffer.byteLength
  );
  return new ImageData(clamped, width, height);
}

function time<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  return [result, performance.now() - start];
}

export function generate(): void {
  clearTimeout(debounce);
  stopPlayback();
  const generator = currentGenerator();
  const params = paramsFor(generator);
  const { width, height, depth } = settings;

  try {
    if (generator.dims === 2) {
      const [noise, createMs] = time(() => generator.create(width, height, params));
      const [frame, pixelMs] = time(() =>
        toImageData(Noise2D.toPixelBuffer(noise), Noise2D.getWidth(noise), Noise2D.getHeight(noise))
      );
      const [stats, statsMs] = time(() => {
        const acc = new StatsAccumulator();
        Noise2D.forEach(noise, (v) => acc.add(v));
        return acc.result();
      });
      setView({ dims: 2, noise, frame, stats });
      renderTiming({ create: createMs, toPixelBuffer: pixelMs, stats: statsMs });
    } else {
      const [noise, createMs] = time(() => generator.create(width, height, depth, params));
      const [frames, pixelMs] = time(() =>
        Noise3D.toPixelBuffers(noise).map((b) =>
          toImageData(b, Noise3D.width(noise), Noise3D.height(noise))
        )
      );
      const [volumeStats, statsMs] = time(() => {
        const acc = new StatsAccumulator();
        Noise3D.forEach(noise, (v) => acc.add(v));
        return acc.result();
      });
      setView({ dims: 3, noise, frames, layerStats: [], volumeStats });
      renderTiming({ create: createMs, toPixelBuffers: pixelMs, stats: statsMs });

      els.layer.max = String(frames.length - 1);
      els.layer.value = String(Math.min(els.layer.valueAsNumber || 0, frames.length - 1));
    }
    showError(undefined);
  } catch (err) {
    setView(undefined);
    showError(err instanceof Error ? (err.stack ?? err.message) : String(err));
  }

  els.layerControls.hidden = getView()?.dims !== 3;
  draw();
}
