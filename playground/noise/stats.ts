export const HISTOGRAM_BINS = 32;

export interface Stats {
  count: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  /** Finite values below 0 or at/above 1, which toPixelBuffer can't represent. */
  outOfRange: number;
  nonFinite: number;
  /** Counts of values in [0, 1) split into HISTOGRAM_BINS buckets. */
  bins: number[];
  below: number;
  above: number;
}

/** Streams values in one at a time so it can sit inside Noise2D/Noise3D forEach. */
export class StatsAccumulator {
  #count = 0;
  #min = Number.POSITIVE_INFINITY;
  #max = Number.NEGATIVE_INFINITY;
  #sum = 0;
  #sumSq = 0;
  #nonFinite = 0;
  #below = 0;
  #above = 0;
  #bins = new Array<number>(HISTOGRAM_BINS).fill(0);

  add(value: number): void {
    if (!Number.isFinite(value)) {
      this.#nonFinite++;
      return;
    }
    this.#count++;
    if (value < this.#min) this.#min = value;
    if (value > this.#max) this.#max = value;
    this.#sum += value;
    this.#sumSq += value * value;

    if (value < 0) this.#below++;
    else if (value >= 1) this.#above++;
    else {
      const bin = Math.floor(value * HISTOGRAM_BINS);
      this.#bins[bin] = (this.#bins[bin] ?? 0) + 1;
    }
  }

  result(): Stats {
    const count = this.#count;
    const mean = count ? this.#sum / count : Number.NaN;
    const variance = count ? this.#sumSq / count - mean * mean : Number.NaN;
    return {
      count,
      min: count ? this.#min : Number.NaN,
      max: count ? this.#max : Number.NaN,
      mean,
      stdDev: Math.sqrt(Math.max(0, variance)),
      outOfRange: this.#below + this.#above,
      nonFinite: this.#nonFinite,
      bins: [...this.#bins],
      below: this.#below,
      above: this.#above,
    };
  }
}
