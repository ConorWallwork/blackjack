class Dealer(object):

    # def getScore():
    def __init__(self, deck):
        self.hand = []

    def deal(self, cards:list) -> str: #hit, sit, bust
        for card in cards:
            self.hand.append(card)
  


    # def dealNext(self):
    
    # def isSit():

