from hand import Hand
from deck import Deck
from functions import total

class Round():
    def __init__(self, bet):
        self.player_hand = Hand()
        self.dealer_hand = Hand()
        self.deck = Deck()
        self.stage = "pre-deal"
        self.bet = bet
    
    def deal_start(self):
        self.dealer_hand.deal(self.deck.pop(2))
        self.player_hand.deal(self.deck.pop(2))
        self.stage = "player_turn"
        
    def hit(self):
        self.player_hand.deal(self.deck.pop(1))
        if(total(self.player_hand.cards) > 21):
            self.stage = "round_end"
    
    def sit(self):
        self.stage = "dealer_turn"
    
    def deal_to_dealer(self):
        while(total(self.dealer_hand.cards) < 17):
            self.dealer_hand.deal(self.deck.pop(1))
        self.stage = "round_end"
            

        
            
        

