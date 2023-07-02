import { ChipValue } from "../routes/seat";

/** Assume stack must be a multiple of 5 */
export function chips(stack: number): { [P in ChipValue]?: number } {
  const chips: { [P in ChipValue]?: number } = {};
  if (stack % 10 > 0) {
    chips[5] = 1;
  }
  stack = Math.floor(stack / 10);
  let pow = 1;
  while (stack > 0 && pow < 5) {
    let mod = stack % 10;
    if (mod == 0) {
      pow++;
      stack = Math.floor(stack / 10);
      continue;
    }
    // use the chips with value beginning with 5
    if (mod >= 5) {
      chips[(5 * Math.pow(10, pow)) as ChipValue] = 1;
      mod -= 5;
    }
    if (mod > 0) {
      chips[Math.pow(10, pow) as ChipValue] = mod;
    }
    pow++;
    stack = Math.floor(stack / 10);
  }
  if (stack > 0) {
    chips[10000] = stack / 10000;
  }
  return chips;
}
