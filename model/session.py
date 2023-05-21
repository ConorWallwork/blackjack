from round import Round
from functions import total

class Session():
    def __init__(self, starting_stack):
        self.stack = starting_stack
        self.session_id = get_new_session_id()
        self.round = None
    
    
    def start_round(self, bet):
        if(self.round and not (self.round.stage == "round_end")):
            raise Exception("There is already an active round")
        if(bet > self.stack or bet < 1):
            raise Exception("Invalid bet")
        self.round = Round(bet)
        self.round.deal_start()
        return {
            "player_hand": self.round.player_hand,
            "dealer_hand": self.round.dealer_hand[0]
        }
    
    def hit(self):
        if(not self.round.stage == "player_turn"):
            raise Exception("It is not the player turn")
        
        self.round.hit()
        if(self.round.stage == "round_end"):
            self.stack -= self.round.bet
        return self.round.player_hand[-1]
    
    def sit(self):
        if(not self.round.stage == "player_turn"):
            raise Exception("It is not the player turn")
        self.round.sit()
    
    def deal_to_dealer(self):
        if(not self.round.stage == "dealer_turn"):
            raise Exception("It is not the dealer turn")

        self.round.deal_to_dealer()
        if(total(self.round.player_hand) > total(self.round.dealer_hand)):
            self.stack += self.round.bet
        else:
            self.stack -= self.round.bet
        return self.round.dealer_hand[1:]

def get_new_session_id():
    return "foo"