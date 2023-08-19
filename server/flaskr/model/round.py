from .deck import Deck
from .functions import total, value

# Round encapsulates one round of black jack. Ensuring that the user does
# not make an action when it is not the correct stage for that action.
# Does not calculate or store winner/loser information


class Round:
    # Create a round from scratch or with optional parameter
    def __init__(
        self,
        bet,
        player_hand=[],
        dealer_hand=[],
        deck=None,
        stage="pre_deal",
        id=None,
        has_split=False,
        has_doubled_down=False,
        hand_sits=[False, False],
        hand_busts=[False, False],
    ):
        self.player_hand = player_hand
        self.dealer_hand = dealer_hand
        self.deck = deck if deck is not None else Deck.new()
        self.stage = stage
        self.bet = bet
        self.id = id
        self.has_split = has_split
        self.has_doubled_down = has_doubled_down
        self.hand_sits = hand_sits
        self.hand_busts = hand_busts

    def start(self):
        if not (self.stage == "pre_deal"):
            raise Exception("The first cards have already been dealt")
        dealer_cards, self.deck = Deck.pop(self.deck, 1)
        self.dealer_hand = self.dealer_hand + dealer_cards
        player_cards, self.deck = Deck.pop(self.deck, 2)
        self.player_hand = self.player_hand + player_cards
        self.stage = "player_turn"

    def hit(self, hand=None):
        if not (self.stage == "player_turn"):
            raise Exception("It is not the player's turn")
        if hand is not None:
            if not self.has_split:
                raise Exception("This round has not been split")
            if self.hand_busts[hand] or self.hand_sits[hand]:
                raise Exception("It is not the player's turn for this hand")
            new_card, self.deck = Deck.pop(self.deck, 1)
            self.player_hand[hand] = self.player_hand[hand] + new_card
            if total(self.player_hand[hand]) > 21:
                self.hand_busts[hand] = True
                if self.hand_busts[0] and self.hand_busts[1]:
                    self.stage = "round_end"
                elif (self.hand_busts[0] or self.hand_sits[0]) and (
                    self.hand_busts[1] or self.hand_sits[1]
                ):
                    self.stage = "dealer_turn"
        else:
            if self.has_split:
                raise Exception("You must specify which hand to hit on a split round")
            new_card, self.deck = Deck.pop(self.deck, 1)
            self.player_hand = self.player_hand + new_card
            if total(self.player_hand) > 21:
                self.stage = "round_end"

    def split(self):
        if not (self.stage == "player_turn"):
            raise Exception("It is not the player's turn")
        if self.has_split:
            raise Exception("This round has already been split")
        if len(self.player_hand) != 2:
            raise Exception("You must split on your first turn")
        if not value(self.player_hand[0]) == value(self.player_hand[1]):
            raise Exception("Your cards must have the same value in order to split")
        self.has_split = True
        self.hand_sits = [False, False]
        self.player_hand = [[self.player_hand[0]], [self.player_hand[1]]]
        self.hit(0)
        self.hit(1)

    def sit(self, hand=None):
        if not (self.stage == "player_turn"):
            raise Exception("It is not the player's turn")
        if hand is not None:
            if not self.has_split:
                raise Exception("This round has not been split")
            if self.hand_busts[hand] or self.hand_sits[hand]:
                raise Exception("It is not the player's turn for this hand")
            self.hand_sits[hand] = True
            if (self.hand_busts[0] or self.hand_sits[0]) and (
                self.hand_busts[1] or self.hand_sits[1]
            ):
                self.stage = "dealer_turn"
        else:
            if self.has_split:
                raise Exception("You must specify which hand to sit on a split round")
            self.stage = "dealer_turn"

    def end(self):
        if not (self.stage == "dealer_turn"):
            raise Exception("It is not the dealer's turn")
        while total(self.dealer_hand) < 17:
            new_card, self.deck = Deck.pop(self.deck, 1)
            self.dealer_hand = self.dealer_hand + new_card
        self.stage = "round_end"
