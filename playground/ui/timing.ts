import { els } from './dom.js';

export function renderTiming(timings: Record<string, number>): void {
  els.timingBody.replaceChildren(
    ...Object.entries(timings).map(([label, ms]) => {
      const tr = document.createElement('tr');
      const name = document.createElement('td');
      name.textContent = label;
      const value = document.createElement('td');
      value.textContent = `${ms.toFixed(1)} ms`;
      tr.append(name, value);
      return tr;
    })
  );
}
