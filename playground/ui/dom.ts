function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

export const els = {
  generator: $<HTMLSelectElement>('generator'),
  width: $<HTMLInputElement>('width'),
  height: $<HTMLInputElement>('height'),
  depth: $<HTMLInputElement>('depth'),
  depthField: $<HTMLLabelElement>('depth-field'),
  params: $<HTMLDivElement>('params'),
  zoom: $<HTMLSelectElement>('zoom'),
  auto: $<HTMLInputElement>('auto'),
  generate: $<HTMLButtonElement>('generate'),
  error: $<HTMLDivElement>('error'),
  canvas: $<HTMLCanvasElement>('canvas'),
  layerControls: $<HTMLDivElement>('layer-controls'),
  play: $<HTMLButtonElement>('play'),
  layer: $<HTMLInputElement>('layer'),
  layerLabel: $<HTMLSpanElement>('layer-label'),
  fps: $<HTMLInputElement>('fps'),
  readout: $<HTMLDivElement>('readout'),
  statsColA: $<HTMLTableCellElement>('stats-col-a'),
  statsColB: $<HTMLTableCellElement>('stats-col-b'),
  statsBody: $<HTMLTableSectionElement>('stats-body'),
  histogram: $<HTMLCanvasElement>('histogram'),
  histogramScope: $<HTMLElement>('histogram-scope'),
  timingBody: $<HTMLTableSectionElement>('timing-body'),
};
