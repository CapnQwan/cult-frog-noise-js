import { fmt } from '../helpers/format.js';
import { getView } from '../noise/view.js';
import { els } from './dom.js';
import { drawHistogram } from './histogram.js';

import type { Stats } from '../noise/stats.js';

const STAT_ROWS: { label: string; get: (s: Stats) => string; warn?: (s: Stats) => boolean }[] = [
  { label: 'min', get: (s) => fmt(s.min), warn: (s) => s.min < 0 },
  { label: 'max', get: (s) => fmt(s.max), warn: (s) => s.max >= 1 },
  { label: 'mean', get: (s) => fmt(s.mean) },
  { label: 'std dev', get: (s) => fmt(s.stdDev) },
  { label: 'values', get: (s) => s.count.toLocaleString() },
  {
    label: 'outside [0, 1)',
    get: (s) => `${s.outOfRange.toLocaleString()} (${fmt((100 * s.outOfRange) / s.count, 2)}%)`,
    warn: (s) => s.outOfRange > 0,
  },
  {
    label: 'NaN / ±Inf',
    get: (s) => s.nonFinite.toLocaleString(),
    warn: (s) => s.nonFinite > 0,
  },
];

export function renderStats(a: Stats | undefined, b: Stats | undefined): void {
  const is3d = getView()?.dims === 3;
  els.statsColA.textContent = is3d ? `Layer ${els.layer.value}` : 'Map';
  els.statsColB.hidden = !is3d;

  els.statsBody.replaceChildren(
    ...STAT_ROWS.map((row) => {
      const tr = document.createElement('tr');
      const th = document.createElement('td');
      th.textContent = row.label;
      tr.append(th);
      for (const s of is3d ? [a, b] : [a]) {
        const td = document.createElement('td');
        td.textContent = s ? row.get(s) : '–';
        if (s && row.warn?.(s)) td.className = 'warn';
        tr.append(td);
      }
      return tr;
    })
  );

  els.histogramScope.textContent = is3d ? `layer ${els.layer.value}, [0, 1)` : '[0, 1)';
  drawHistogram(a);
}
