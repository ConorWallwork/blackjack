from player_hand import PlayerHand
from hand import Hand
from deck import Deck
from functions import total

class Round():
    def __init__(self, bet):
        self.player_hand = PlayerHand(bet)
        self.dealer = Hand()
        self.deck = Deck()
        self.stage = "pre-deal"
    
    def deal_start(self):
        self.dealer.deal(self.deck.pop(2))
        self.player_hand.hand.deal(self.deck.pop(2))
        self.stage = "player_turn"
        
    def hit(self):
        if(not self.stage == "player_turn"):
            raise Exception("It is not the player turn") 
        self.player_hand.hand.deal(self.deck.pop(1))
        if(total(self.player_hand.hand.cards) > 21):
            self.stage = "round_end"
    
    def sit(self):
        self.stage = "dealer_turn"
    
    def deal_to_dealer(self):
        while(total(dealer.cards) < 17):
            self.dealer.deal(self.deck.pop(1))
        self.stage = "round_end"
        if(total(dealer.cards) > total(self.player_hand.hand.cards)):
            

        
            
        

