from typing import Tuple
import numpy
class Deck(object):

    def __init__(self):
        return
    
    @staticmethod
    def new() -> list:
        deck = numpy.arange(52)
        numpy.random.shuffle(deck)
        return deck.tolist()

    @staticmethod
    def pop(deck: list, n: int) -> Tuple[list, list]:
        return deck[:n], deck[n:]