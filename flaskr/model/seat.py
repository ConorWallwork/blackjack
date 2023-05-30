from .round import Round
from .functions import total
import uuid


class Seat():
    def __init__(self, starting_stack, nickname, round=None, id=None):
        self.stack = starting_stack
        self.id = get_new_seat_id() if id is None else id
        self.round = round
        self.nickname = nickname

    def round_start(self, bet):
        if (self.round and not (self.round.stage == "round_end")):
            raise Exception("There is already an active round")
        if (bet > self.stack or bet < 1):
            raise Exception("Invalid bet")
        self.round = Round(bet)
        self.round.start()
        return {
            "player_hand": self.round.player_hand,
            "dealer_hand": self.round.dealer_hand[0]
        }

    def round_hit(self):
        self.round.hit()
        if (self.round.stage == "round_end"):
            self.stack -= self.round.bet
        return self.round.player_hand[-1]

    def round_sit(self):
        self.round.sit()

    def round_end(self):
        self.round.end()
        if (total(self.round.player_hand) > total(self.round.dealer_hand) or total(self.round.dealer_hand) > 21):
            self.stack += self.round.bet
        else:
            self.stack -= self.round.bet
        return self.round.dealer_hand[1:]

    def set_round(self, round):
        self.round = round


def get_new_seat_id():
    return uuid.uuid4().hex
