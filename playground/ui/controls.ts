import { generate, scheduleGenerate } from '../noise/generate.js';
import { GENERATORS } from '../noise/generators/index.js';
import { currentGenerator, paramsFor, saveSettings, settings } from '../noise/settings.js';
import { els } from './dom.js';
import { applyZoom } from './draw.js';

function buildGeneratorSelect(): void {
  for (const g of GENERATORS) {
    const option = document.createElement('option');
    option.value = g.id;
    option.textContent = `${g.label} (${g.dims}D)`;
    els.generator.append(option);
  }
}

function buildParamInputs(): void {
  const generator = currentGenerator();
  const params = paramsFor(generator);
  els.params.replaceChildren();

  for (const p of generator.params) {
    const label = document.createElement('label');
    label.className = 'field';
    const span = document.createElement('span');
    span.textContent = p.label;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = String(params[p.key]);
    input.step = String(p.step ?? 'any');
    if (p.min !== undefined) input.min = String(p.min);
    if (p.max !== undefined) input.max = String(p.max);
    input.addEventListener('input', () => {
      const value = input.valueAsNumber;
      if (Number.isNaN(value)) return;
      params[p.key] = value;
      onSettingsChanged();
    });
    label.append(span, input);
    els.params.append(label);
  }

  els.depthField.hidden = generator.dims !== 3;
}

function syncInputsFromSettings(): void {
  els.generator.value = currentGenerator().id;
  els.width.value = String(settings.width);
  els.height.value = String(settings.height);
  els.depth.value = String(settings.depth);
  els.zoom.value = String(settings.zoom);
  els.fps.value = String(settings.fps);
  els.auto.checked = settings.auto;
  buildParamInputs();
}

function readInt(input: HTMLInputElement, fallback: number): number {
  const value = Math.trunc(input.valueAsNumber);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function onSettingsChanged(): void {
  saveSettings();
  if (!settings.auto) return;
  scheduleGenerate();
}

export function initControls(): void {
  els.generator.addEventListener('change', () => {
    settings.generator = els.generator.value;
    buildParamInputs();
    onSettingsChanged();
  });

  for (const [input, key] of [
    [els.width, 'width'],
    [els.height, 'height'],
    [els.depth, 'depth'],
  ] as const) {
    input.addEventListener('input', () => {
      settings[key] = readInt(input, settings[key]);
      onSettingsChanged();
    });
  }

  els.zoom.addEventListener('change', () => {
    settings.zoom = Number(els.zoom.value);
    saveSettings();
    applyZoom();
  });

  els.fps.addEventListener('input', () => {
    settings.fps = readInt(els.fps, settings.fps);
    saveSettings();
  });

  els.auto.addEventListener('change', () => {
    settings.auto = els.auto.checked;
    saveSettings();
  });

  els.generate.addEventListener('click', generate);

  buildGeneratorSelect();
  syncInputsFromSettings();
}
