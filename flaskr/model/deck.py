import time
from typing import Tuple
import random
class Deck(object):

    def __init__(self):
        return
    
    @staticmethod
    def new() -> list:
        deck = [i for i in range(52)]
        random.shuffle(deck)
        return deck

    @staticmethod
    def pop(deck: list, n: int) -> Tuple[list, list]:
        return deck[:n], deck[n:]