from deck import Deck
from round import Round
from functions import *
import numpy
from session import Session


def main():
    round = Round(100)
    print(round.__dict__)
    round.deal_start()
    print(round.__dict__, len(round.deck))




if __name__ == '__main__':
    main()




