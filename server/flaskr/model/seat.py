from .round import Round
from .functions import total
import uuid


class Seat:
    def __init__(self, starting_stack, nickname, round=None, id=None):
        self.stack = starting_stack
        self.id = get_new_seat_id() if id is None else id
        self.round = round
        self.nickname = nickname

    def round_start(self, bet):
        if self.round and not (self.round.stage == "round_end"):
            raise Exception("There is already an active round")
        if bet > self.stack or bet < 1:
            raise Exception("Invalid bet")
        self.round = Round(bet)
        self.round.start()
        return {
            "player_hand": self.round.player_hand,
            "dealer_hand": [self.round.dealer_hand[0]],
        }

    def round_hit(self, hand=None):
        self.round.hit(hand)
        if hand is not None:
            if self.round.hand_busts[hand]:
                self.stack -= self.round.bet
            return self.round.player_hand[hand][-1]
        else:
            if self.round.stage == "round_end":
                self.stack -= self.round.bet
            return self.round.player_hand[-1]

    def round_sit(self, hand=None):
        self.round.sit(hand)

    def round_split(self):
        if self.round.bet * 2 > self.stack:
            raise Exception("Your stack is not large enough to split")
        self.round.split()
        return [self.round.player_hand[0][1], self.round.player_hand[1][1]]

    def round_end(self):
        self.round.end()
        dealer_total = total(self.round.dealer_hand)
        if self.round.has_split:
            for i in range(2):
                player_total = total(self.round.player_hand[i])
                if self.round.hand_sits[i]:
                    if player_total > dealer_total or dealer_total > 21:
                        self.stack += self.round.bet
                    elif player_total < dealer_total:
                        self.stack -= self.round.bet
        else:
            if total(self.round.player_hand) > dealer_total or dealer_total > 21:
                self.stack += self.round.bet
            elif total(self.round.player_hand) < dealer_total:
                self.stack -= self.round.bet
        # otherwise draw, stack does not change
        return self.round.dealer_hand[1:]

    def set_round(self, round):
        self.round = round


def get_new_seat_id():
    return uuid.uuid4().hex
