from app import db, login
from app.methods import make_path
import cccbr_methods
from datetime import date, timedelta
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cards = db.relationship("Card", back_populates="user")

    def add_method(self, method_name):
        method = cccbr_methods.get(method_name)
        for i in range(2, method.stage + 1):
            c = Card(id = '{}-{}-{}'.format(self.id, method.title, i),
                     method_name = method.title,
                     place_bell = i,
                     user = self,
                     study_next = date.today())
            db.session.add(c)
        db.session.commit()

    def today(self):
        return [c for c in self.cards if c.study_next <= date.today()]

    def get_card(self, card_id):
        for card in self.cards:
            if card.id == card_id:
                return card
        return None

    def mark_card(self, card_id):
        card = self.get_card(card_id)
        card.study_next += timedelta(days=1)
        db.session.commit()
        return card

    def reset_card(self, card_id):
        card = self.get_card(card_id)
        card.study_next = date.today()
        db.session.commit()
        return card

    def reset_all_cards(self):
        for card in self.cards:
            card.study_next = date.today()
        db.session.commit()
        return len(self.today())



class Card(db.Model):
    id = db.Column(db.String(), primary_key=True)
    method_name = db.Column(db.String())
    place_bell = db.Column(db.Integer)
    study_next = db.Column(db.Date)
    fk_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", back_populates="cards")

    def mark_done(self):
        self.show_next += timedelta(days=1)

    @property
    def method(self):
        return cccbr_methods.get(self.method_name)

    @property
    def card_dict(self):
        card = {
            'id': self.id,
            'method': self.method.title,
            'stage': self.method.stage,
            'treble_path': make_path(self.method.full_notation_list, 1),
            'place_bell': self.place_bell,
            'blueline': make_path(self.method.full_notation_list, self.place_bell),
            'lead_length': self.method.lengthoflead,
        }
        return card
