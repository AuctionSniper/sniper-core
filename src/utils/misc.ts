export function percentageBetween(v1: number, v2: number): number {
  return v1 >= v2 ? 0 : (v1 * 100) / v2;
}
