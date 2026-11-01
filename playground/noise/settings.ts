import { GENERATORS } from './generators/index.js';

import type { Generator } from './generators/types.js';

interface Settings {
  generator: string;
  width: number;
  height: number;
  depth: number;
  zoom: number;
  fps: number;
  auto: boolean;
  params: Record<string, Record<string, number>>;
}

const STORAGE_KEY = 'cult-frog-noise-playground';

const DEFAULT_SETTINGS: Settings = {
  generator: GENERATORS[0]?.id ?? '',
  width: 128,
  height: 128,
  depth: 32,
  zoom: 3,
  fps: 12,
  auto: true,
  params: {},
};

// Per browser, survives Vite reloads after editing src
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // storage unavailable or corrupt, fall through to defaults
  }
  return structuredClone(DEFAULT_SETTINGS);
}

export const settings = loadSettings();

export function saveSettings(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function currentGenerator(): Generator {
  return GENERATORS.find((g) => g.id === settings.generator) ?? (GENERATORS[0] as Generator);
}

export function paramsFor(generator: Generator): Record<string, number> {
  // Always the same object per generator: the param inputs write into it and generate() reads it.
  const params = settings.params[generator.id] ?? {};
  for (const p of generator.params) params[p.key] ??= p.default;
  settings.params[generator.id] = params;
  return params;
}
