from hand import Hand
from deck import Deck
from dealer import Dealer
from functions import *
import numpy 
from matplotlib import pyplot as plt


def main():
    deck = Deck()
    # hand = Hand()
    
    dealer = Dealer()

    # print(deck.__dict__, dealer.__dict__)

    dealer.deal(deck.pop(2))
    print(deck.__dict__)
    print(dealer.__dict__)
    return total(dealer.hand)
    

if __name__ == '__main__':
    print(main())




