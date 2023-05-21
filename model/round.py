from deck import Deck
from functions import total

class Round():
    def __init__(self, bet):
        self.player_hand = []
        self.dealer_hand = []
        self.deck = Deck.new()
        self.stage = "pre-deal"
        self.bet = bet
    
    def deal_start(self):
        dealer_cards, self.deck = Deck.pop(self.deck, 2)
        self.dealer_hand = self.dealer_hand + dealer_cards
        player_cards, self.deck = Deck.pop(self.deck, 2)
        self.player_hand = self.player_hand + player_cards
        self.stage = "player_turn"
        
    def hit(self):
        new_card, self.deck = Deck.pop(self.deck, 1)
        self.player_hand = self.player_hand + new_card
        if(total(self.player_hand) > 21):
            self.stage = "round_end"
    
    def sit(self):
        self.stage = "dealer_turn"
    
    def deal_to_dealer(self):
        while(total(self.dealer_hand) < 17):
            new_card, self.deck = Deck.pop(self.deck, 1)
            self.dealer_hand = self.dealer_hand + new_card
        self.stage = "round_end"
            

        
            
        

