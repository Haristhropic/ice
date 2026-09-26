export function randIdx(len: number): number {
  return Math.floor(Math.random() * len);
}

export function randFloat(max = 1): number {
  return Math.random() * max;
}