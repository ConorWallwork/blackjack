import { ChipValue } from "../routes/seat";

export type ChipCounts = { [P in ChipValue]?: number };

/** Assume stack must be a multiple of 5 */
export function chips(stack: number): { [P in ChipValue]?: number } {
  const chips: { [P in ChipValue]?: number } = {};
  if (stack % 10 > 0) {
    chips[5] = 1;
  }
  // truncate the least significant digit
  stack = Math.floor(stack / 10);
  let pow = 1;
  while (stack > 0 && pow < 5) {
    let mod = stack % 10;
    if (mod == 0) {
      // it was a multiple of ten, increase order of magnitude and truncate
      pow++;
      stack = Math.floor(stack / 10);
      continue;
    }
    if (mod >= 5) {
      // use chip value beginning with 5, instead of using
      // 5 chips of the 10^(pow) value
      chips[(5 * Math.pow(10, pow)) as ChipValue] = 1;
      mod -= 5;
    }
    if (mod > 0) {
      // now we make up the value of mod*10^(pow) using chips of value
      // 10^(pow)
      chips[Math.pow(10, pow) as ChipValue] = mod;
    }
    // increase order of magnitude and truncate to check for
    // chip counts of the larger value
    pow++;
    stack = Math.floor(stack / 10);
  }
  if (stack > 0) {
    chips[10000] = stack / 10000;
  }
  return chips;
}
