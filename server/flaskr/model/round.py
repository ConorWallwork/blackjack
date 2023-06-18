from .deck import Deck
from .functions import total

## Round encapsulates one round of black jack. Ensuring that the user does
## not make an action when it is not the correct stage for that action.
## Does not calculate or store winner/loser information
class Round():
    ## Create a round from scratch or with optional parameter
    def __init__(self, bet, player_hand=[], dealer_hand=[], deck=None, stage="pre_deal", id=None):
        self.player_hand = player_hand
        self.dealer_hand = dealer_hand
        self.deck = deck if deck is not None else Deck.new()
        self.stage = stage
        self.bet = bet
        self.id = id  
    
    def start(self):
        if(not (self.stage == "pre_deal")):
            raise Exception("The first cards have already been dealt")
        dealer_cards, self.deck = Deck.pop(self.deck, 1)
        self.dealer_hand = self.dealer_hand + dealer_cards
        player_cards, self.deck = Deck.pop(self.deck, 2)
        self.player_hand = self.player_hand + player_cards
        self.stage = "player_turn"
        
    def hit(self):
        if(not (self.stage == "player_turn")):
            raise Exception("It is not the player's turn")
        new_card, self.deck = Deck.pop(self.deck, 1)
        self.player_hand = self.player_hand + new_card
        if(total(self.player_hand) > 21):
            self.stage = "round_end"
    
    def sit(self):
        if(not (self.stage == "player_turn")):
            raise Exception("It is not the player's turn")
        self.stage = "dealer_turn"
    
    def end(self):
        if(not (self.stage == "dealer_turn")):
            raise Exception("It is not the dealer's turn")
        while(total(self.dealer_hand) < 17):
            new_card, self.deck = Deck.pop(self.deck, 1)
            self.dealer_hand = self.dealer_hand + new_card
        self.stage = "round_end"
            

        
            
        

