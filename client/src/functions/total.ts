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

export function getValue(card: number): number | string {
  const index = card % 13;
  if (index === 0) return "A";
  else if (index > 0 && index < 10) return index + 1;
  else return ["J", "Q", "K"][index - 10];
}

export function getSuit(card: number): "S" | "C" | "D" | "H" {
  const suits: ("S" | "C" | "D" | "H")[] = ["S", "C", "D", "H"];
  return suits[Math.floor(card / 13)];
}
