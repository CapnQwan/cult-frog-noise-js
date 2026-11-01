import { els } from './dom.js';

export function showError(message: string | undefined): void {
  els.error.hidden = !message;
  els.error.textContent = message ?? '';
}
