import { settings } from '../noise/settings.js';
import { getView } from '../noise/view.js';
import { els } from './dom.js';
import { draw } from './draw.js';

let playing = false;
let lastFrameAt = 0;

export function stopPlayback(): void {
  playing = false;
  els.play.textContent = '▶';
  els.play.setAttribute('aria-label', 'Play layers');
}

function tick(now: number): void {
  const view = getView();
  if (!playing || view?.dims !== 3) return;
  if (now - lastFrameAt >= 1000 / settings.fps) {
    lastFrameAt = now;
    els.layer.value = String((els.layer.valueAsNumber + 1) % view.frames.length);
    draw();
  }
  requestAnimationFrame(tick);
}

export function initPlayback(): void {
  els.play.addEventListener('click', () => {
    if (playing) return stopPlayback();
    playing = true;
    els.play.textContent = '❚❚';
    els.play.setAttribute('aria-label', 'Pause layers');
    requestAnimationFrame(tick);
  });

  els.layer.addEventListener('input', draw);
}
