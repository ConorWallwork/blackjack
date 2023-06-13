export function total(hand: number[]) {
  if (hand.length === 0) return 0;
  let total = 0;
  let hasAce = false;
  for (const card of hand) {
    if (card % 13 === 0) {
      total += 1;
      hasAce = true;
    } else if (card % 13 > 0 && card % 13 < 10) {
      total += (card % 13) + 1;
    } else {
      total += 10;
    }
    if (total < 12 && hasAce) {
      total += 10;
    }
  }
  return total;
}
