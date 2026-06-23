import { combination, factorial, roundTo } from "./combinations";

export function binomialPmf(n: number, p: number, x: number): number {
  if (x < 0 || x > n) return 0;
  return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

export function binomialCdf(n: number, p: number, x: number): number {
  let sum = 0;
  for (let i = 0; i <= x; i++) sum += binomialPmf(n, p, i);
  return sum;
}

export function binomialAtLeast(n: number, p: number, x: number): number {
  let sum = 0;
  for (let i = x; i <= n; i++) sum += binomialPmf(n, p, i);
  return sum;
}

export function hypergeometricPmf(N: number, K: number, n: number, x: number): number {
  if (x < 0 || x > n || x > K || n - x > N - K) return 0;
  return (combination(K, x) * combination(N - K, n - x)) / combination(N, n);
}

export function geometricPmf(p: number, x: number): number {
  if (x < 1) return 0;
  return p * Math.pow(1 - p, x - 1);
}

export function geometricCdf(p: number, x: number): number {
  let sum = 0;
  for (let i = 1; i <= x; i++) sum += geometricPmf(p, i);
  return sum;
}

export function poissonPmf(lambda: number, x: number): number {
  if (x < 0) return 0;
  return (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial(x);
}

export function poissonCdf(lambda: number, x: number): number {
  let sum = 0;
  for (let i = 0; i <= x; i++) sum += poissonPmf(lambda, i);
  return sum;
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const coef = 1 / (sigma * Math.sqrt(2 * Math.PI));
  return coef * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

// Abramowitz and Stegun approximation for standard normal CDF
export function normalCdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

export function inverseNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) return NaN;
  // Rational approximation
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.75928508446974e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580619e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700397e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

export function generateBinomialData(n: number, p: number) {
  return Array.from({ length: n + 1 }, (_, x) => ({
    x,
    probability: roundTo(binomialPmf(n, p, x), 6),
  }));
}

export function generatePoissonData(lambda: number, maxX = 20) {
  const limit = Math.max(maxX, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  return Array.from({ length: limit + 1 }, (_, x) => ({
    x,
    probability: roundTo(poissonPmf(lambda, x), 6),
  }));
}

export function generateNormalData(mu: number, sigma: number, points = 100) {
  const min = mu - 4 * sigma;
  const max = mu + 4 * sigma;
  const step = (max - min) / points;
  return Array.from({ length: points + 1 }, (_, i) => {
    const x = min + i * step;
    return { x: roundTo(x, 2), probability: roundTo(normalPdf(x, mu, sigma), 6) };
  });
}

export function generateHypergeometricData(N: number, K: number, n: number) {
  const maxX = Math.min(n, K);
  return Array.from({ length: maxX + 1 }, (_, x) => ({
    x,
    probability: roundTo(hypergeometricPmf(N, K, n, x), 6),
  }));
}

// Z-table values for common z scores
export const Z_TABLE: Record<string, number> = {};
for (let i = 0; i <= 350; i++) {
  const z = i / 100;
  Z_TABLE[z.toFixed(2)] = roundTo(normalCdf(z), 4);
}

export function lookupZTable(z: number): number {
  const absZ = Math.abs(z);
  const rounded = Math.round(absZ * 100) / 100;
  const val = normalCdf(rounded);
  return z >= 0 ? val : 1 - val;
}

export type DistributionType = "binomial" | "hypergeometric" | "poisson" | "normal" | "geometric";

export interface DistributionParams {
  n?: number;
  p?: number;
  N?: number;
  K?: number;
  lambda?: number;
  mu?: number;
  sigma?: number;
}

export function calculateProbability(
  distribution: DistributionType,
  params: DistributionParams,
  x: number,
  calcType: "exact" | "lessThan" | "greaterThan"
): { result: number; steps: { step: number; title: string; content: string; explanation: string }[] } {
  const steps: { step: number; title: string; content: string; explanation: string }[] = [];
  let result = 0;

  if (distribution === "binomial") {
    const n = params.n ?? 10;
    const p = params.p ?? 0.5;
    steps.push({
      step: 1,
      title: "Identify parameters",
      content: `n = ${n}, p = ${p}, x = ${x}`,
      explanation: "Binomial distribution requires number of trials and success probability.",
    });
    if (calcType === "exact") {
      result = binomialPmf(n, p, x);
      steps.push({
        step: 2,
        title: "Apply PMF",
        content: `P(X=${x}) = C(${n},${x}) × ${p}^${x} × ${(1 - p).toFixed(4)}^${n - x} = ${roundTo(result, 6)}`,
        explanation: "Use the binomial probability mass function.",
      });
    } else if (calcType === "lessThan") {
      result = binomialCdf(n, p, x);
      steps.push({
        step: 2,
        title: "Sum PMF values",
        content: `P(X≤${x}) = Σ P(X=i) for i=0 to ${x} = ${roundTo(result, 6)}`,
        explanation: "Cumulative probability sums individual probabilities.",
      });
    } else {
      result = binomialAtLeast(n, p, x);
      steps.push({
        step: 2,
        title: "Sum PMF values",
        content: `P(X≥${x}) = Σ P(X=i) for i=${x} to ${n} = ${roundTo(result, 6)}`,
        explanation: "Sum probabilities from x to n.",
      });
    }
  } else if (distribution === "poisson") {
    const lambda = params.lambda ?? 3;
    steps.push({
      step: 1,
      title: "Identify λ",
      content: `λ = ${lambda}, x = ${x}`,
      explanation: "Poisson distribution is defined by rate parameter λ.",
    });
    if (calcType === "exact") {
      result = poissonPmf(lambda, x);
      steps.push({
        step: 2,
        title: "Apply PMF",
        content: `P(X=${x}) = e^(-${lambda}) × ${lambda}^${x} / ${x}! = ${roundTo(result, 6)}`,
        explanation: "Poisson probability mass function.",
      });
    } else if (calcType === "lessThan") {
      result = poissonCdf(lambda, x);
      steps.push({
        step: 2,
        title: "Cumulative sum",
        content: `P(X≤${x}) = ${roundTo(result, 6)}`,
        explanation: "Sum Poisson probabilities from 0 to x.",
      });
    } else {
      result = 1 - poissonCdf(lambda, x - 1);
      steps.push({
        step: 2,
        title: "Complement",
        content: `P(X≥${x}) = 1 - P(X≤${x - 1}) = ${roundTo(result, 6)}`,
        explanation: "Use complement for at-least probabilities.",
      });
    }
  } else if (distribution === "normal") {
    const mu = params.mu ?? 0;
    const sigma = params.sigma ?? 1;
    const z = zScore(x, mu, sigma);
    steps.push({
      step: 1,
      title: "Standardize",
      content: `Z = (X - μ) / σ = (${x} - ${mu}) / ${sigma} = ${roundTo(z, 4)}`,
      explanation: "Convert to standard normal Z-score.",
    });
    if (calcType === "exact") {
      result = 0;
      steps.push({
        step: 2,
        title: "Continuous variable",
        content: "P(X = x) = 0 for continuous distributions",
        explanation: "For continuous RVs, exact point probability is zero.",
      });
    } else if (calcType === "lessThan") {
      result = normalCdf(x, mu, sigma);
      steps.push({
        step: 2,
        title: "Lookup CDF",
        content: `P(X < ${x}) = P(Z < ${roundTo(z, 4)}) = ${roundTo(result, 6)}`,
        explanation: "Use standard normal cumulative distribution.",
      });
    } else {
      result = 1 - normalCdf(x, mu, sigma);
      steps.push({
        step: 2,
        title: "Complement",
        content: `P(X > ${x}) = 1 - P(X < ${x}) = ${roundTo(result, 6)}`,
        explanation: "Use complement rule.",
      });
    }
  } else if (distribution === "hypergeometric") {
    const N = params.N ?? 50;
    const K = params.K ?? 10;
    const n = params.n ?? 5;
    steps.push({
      step: 1,
      title: "Identify parameters",
      content: `N=${N}, K=${K}, n=${n}, x=${x}`,
      explanation: "N=population, K=successes in population, n=sample size.",
    });
    result =
      calcType === "exact"
        ? hypergeometricPmf(N, K, n, x)
        : calcType === "lessThan"
          ? Array.from({ length: x + 1 }, (_, i) => hypergeometricPmf(N, K, n, i)).reduce((a, b) => a + b, 0)
          : Array.from({ length: Math.min(n, K) - x + 1 }, (_, i) =>
              hypergeometricPmf(N, K, n, x + i)
            ).reduce((a, b) => a + b, 0);
    steps.push({
      step: 2,
      title: "Apply hypergeometric PMF",
      content: `Result = ${roundTo(result, 6)}`,
      explanation: "Sampling without replacement formula.",
    });
  } else if (distribution === "geometric") {
    const p = params.p ?? 0.3;
    steps.push({
      step: 1,
      title: "Identify p",
      content: `p = ${p}, x = ${x}`,
      explanation: "Geometric: trials until first success.",
    });
    result =
      calcType === "exact"
        ? geometricPmf(p, x)
        : calcType === "lessThan"
          ? geometricCdf(p, x)
          : 1 - geometricCdf(p, x - 1);
    steps.push({
      step: 2,
      title: "Apply geometric PMF",
      content: `Result = ${roundTo(result, 6)}`,
      explanation: "P(X=x) = p(1-p)^(x-1) for geometric distribution.",
    });
  }

  return { result: roundTo(result, 6), steps };
}
