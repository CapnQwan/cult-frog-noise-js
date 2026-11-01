import { HISTOGRAM_BINS } from '../noise/stats.js';
import { els } from './dom.js';

import type { Stats } from '../noise/stats.js';

const histCtx = els.histogram.getContext('2d') as CanvasRenderingContext2D;

export function drawHistogram(stats: Stats | undefined): void {
  const canvas = els.histogram;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 320;
  const cssHeight = canvas.clientHeight || 120;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  histCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  histCtx.clearRect(0, 0, cssWidth, cssHeight);
  if (!stats || stats.count === 0) return;

  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue('--accent').trim();
  const warn = style.getPropertyValue('--warn').trim();
  const border = style.getPropertyValue('--border').trim();

  // One overflow bar each side for values below 0 / at or above 1.
  const slots = HISTOGRAM_BINS + 2;
  const gap = 1;
  const barWidth = cssWidth / slots;
  const peak = Math.max(stats.below, stats.above, ...stats.bins, 1);
  const plotHeight = cssHeight - 14;

  const bar = (i: number, count: number, color: string) => {
    const h = (count / peak) * plotHeight;
    histCtx.fillStyle = color;
    histCtx.fillRect(i * barWidth + gap / 2, plotHeight - h, barWidth - gap, h);
  };

  bar(0, stats.below, warn);
  for (const [i, count] of stats.bins.entries()) bar(i + 1, count, accent);
  bar(slots - 1, stats.above, warn);

  histCtx.fillStyle = border;
  histCtx.fillRect(0, plotHeight, cssWidth, 1);
  histCtx.fillStyle = style.getPropertyValue('--muted').trim();
  histCtx.font = '10px system-ui, sans-serif';
  histCtx.textBaseline = 'bottom';
  histCtx.textAlign = 'left';
  histCtx.fillText('0', barWidth, cssHeight);
  histCtx.textAlign = 'center';
  histCtx.fillText('0.5', cssWidth / 2, cssHeight);
  histCtx.textAlign = 'right';
  histCtx.fillText('1', cssWidth - barWidth, cssHeight);
}
