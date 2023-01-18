class Player():
    def __init__(self, ):
        self.hand = []
    
    def deal(self, card0, card1):
        self.hand.append(card0)
        self.hand.append(card1)


    def dealNext(self, card):
        self.hand.append(card)


