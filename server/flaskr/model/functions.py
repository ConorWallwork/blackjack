def total(hand: list):
    if len(hand) == 0:
        return 0
    total = 0
    has_ace = False
    for card in hand:
        if card % 13 == 0:
            total += 1
            has_ace = True
        elif card % 13 > 0 and card % 13 < 10:
            total += (card % 13) + 1
        else:
            total += 10
    if total < 12 and has_ace:
        total += 10
    return total


def value(card: int):
    if card % 13 == 0:
        return 1
    elif card % 13 > 0 and card % 13 < 10:
        return (card % 13) + 1
    else:
        return 10
