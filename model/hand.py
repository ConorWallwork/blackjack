class Hand(object):

    # def getScore():
    def __init__(self):
        self.cards = []

    def deal(self, cards:list):
        for card in cards:
            self.cards.append(card)