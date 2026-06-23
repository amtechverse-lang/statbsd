export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function combination(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  r = Math.min(r, n - r);
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

export function permutation(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return combination(n, r) * factorial(r);
}

export function roundTo(n: number, decimals = 4): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
