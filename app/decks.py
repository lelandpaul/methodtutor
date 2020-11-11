import cccbr_methods
from app.methods import make_path
from datetime import date, timedelta
from random import choice

class Card:
    def __init__(self, method_name, place_bell):
        self.method_name = method_name
        self.place_bell = place_bell
        self.show_next = date.today()

    @property
    def method(self):
        return cccbr_methods.get(self.method_name)

    @property
    def card_dict(self):
        card = {
            'method': self.method.title,
            'stage': self.method.stage,
            'treble_path': make_path(self.method.full_notation_list, 1),
            'place_bell': self.place_bell,
            'blueline': make_path(self.method.full_notation_list, self.place_bell),
            'lead_length': self.method.lengthoflead,
        }
        return card

    @staticmethod
    def empty_card():
        card = {
            'method': '',
            'stage': 8,
            'treble_path': [1],
            'place_bell': 1,
            'blueline': [1],
            'lead_length': 32,
        }
        return card



class Deck:
    def __init__(self, name):
        self.name = name
        self.cards = []

    def add_method(self, method_name):
        method = cccbr_methods.get(method_name)
        for i in range(2, method.stage + 1):
            self.cards.append(Card(method_name, i))

    @property
    def cards_remaining(self):
        return [card for card in self.cards if card.show_next <= date.today()]

    def pick_card(self):
        if not self.cards_remaining:
            return Card.empty_card()
        card = choice(self.cards_remaining)
        card.show_next = date.today() + timedelta(days = 1)
        return card.card_dict
