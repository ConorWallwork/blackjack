import numpy
class Deck(object):

    def __init__(self):
        self.reset()

    def reset(self):
        self.cards = numpy.arange(52)
        numpy.random.shuffle(self.cards)

    def pop(self, n: int) -> list:
        cards, new_array = self.cards[0:n], self.cards[n:-1]
        self.cards = new_array
        return cards