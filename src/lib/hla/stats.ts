// src/lib/hla/stats.ts

export interface EffectSizeResult {
  gene: string;
  allele: string;
  nCarriers: number;
  nNonCarriers: number;
  meanCarriers: number;
  meanNonCarriers: number;
  g: number;
  ciLow: number;
  ciHigh: number;
  se: number;
  p: number;
}

// ---------- базовая математика ----------

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs: number[]): number {
  const m = mean(xs);
  const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-x * x);

  return sign * y;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

// ---------- статистика ----------

export function computeHedgesG(
  t1: number[],
  t0: number[]
) {
  const n1 = t1.length;
  const n0 = t0.length;
  if (n1 < 5 || n0 < 5) return null;

  const m1 = mean(t1);
  const m0 = mean(t0);
  const s1 = std(t1);
  const s0 = std(t0);

  const df = n1 + n0 - 2;
  if (df <= 0) return null;

  const sp = Math.sqrt(
    ((n1 - 1) * s1 ** 2 + (n0 - 1) * s0 ** 2) / df
  );
  if (sp === 0) return null;

  const d = (m1 - m0) / sp;

  // Hedges correction
  const J = 1 - 3 / (4 * df - 1);
  const g = J * d;

  const se = Math.sqrt(
    (n1 + n0) / (n1 * n0) + (g ** 2) / (2 * df)
  );

  const ciLow = g - 1.96 * se;
  const ciHigh = g + 1.96 * se;

  const z = g / se;
  const p = 2 * (1 - normalCdf(Math.abs(z)));

  return {
    nCarriers: n1,
    nNonCarriers: n0,
    meanCarriers: m1,
    meanNonCarriers: m0,
    g,
    ciLow,
    ciHigh,
    se,
    p,
  };
}


export function benjaminiHochberg(pVals: number[]): number[] {
  const m = pVals.length;
  const indexed = pVals
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p - b.p);

  const q = new Array(m).fill(1);
  let prev = 1;

  for (let k = m; k >= 1; k--) {
    const { p, i } = indexed[k - 1];
    const val = Math.min((p * m) / k, prev);
    q[i] = val;
    prev = val;
  }

  return q;
}