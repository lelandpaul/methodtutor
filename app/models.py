from app import db, login
from app.methods import make_path
import cccbr_methods
from datetime import date, timedelta
from flask_login import UserMixin
from itertools import chain
from random import shuffle



@login.user_loader
def load_user(id):
    return User.query.get(id)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(32))
    cards = db.relationship("Card", back_populates="user")
    unlimited_reviews = db.Column(db.Boolean, default=True)
    unlimited_new = db.Column(db.Boolean, default=False)
    max_reviews = db.Column(db.Integer, default=20)
    max_new = db.Column(db.Integer, default=2)


    def add_method(self, method_name):
        if method_name in [m['method'] for m in self.methods]:
            return False
        method = cccbr_methods.get(method_name)
        for i in range(2, method.stage + 1):
            c = Card(method_name = method.title,
                     place_bell = i,
                     user = self)
            db.session.add(c)
        db.session.commit()
        return True

    def remove_method(self, method_name):
        for card in self.cards:
            if card.method_name == method_name:
                db.session.delete(card)
        db.session.commit()

    def today(self):
        if self.reviews_today == 0:
            # We haven't done anything yet today
            # (or are pretending so)
            # So mark some cards to study
            self.choose_cards()
        return [c for c in self.cards if c.on_deck]

    def choose_cards(self):
        for card in self.cards:
            card.on_deck = False
        reviews = [c for c in self.cards
                   if not c.is_new() and c.scheduled <= date.today()]
        if not self.unlimited_reviews:
            shuffle(reviews)
            reviews = reviews[:self.max_reviews]
        new = [c for c in self.cards if c.is_new()]
        if not self.unlimited_new:
            new = sorted(new, key=lambda x: (x.method_name, x.place_bell))
            new = new[:self.max_new]
        for card in chain(reviews, new):
            card.on_deck = True
        db.session.commit()
        return len([c for c in self.cards if c.on_deck])

    def get_card(self, card_id):
        for card in self.cards:
            if card.id == card_id:
                return card
        return None

    def mark_card(self, card_id, faults):
        card = self.get_card(card_id)
        return schedule_card(card, faults)

    def reset_card(self, card_id):
        card = self.get_card(card_id)
        card.reset()
        db.session.commit()
        return card

    def reset_all_cards(self):
        for card in self.cards:
            card.reset()
        db.session.commit()
        return len(self.today())

    @property
    def events(self):
        return chain(*[card.reviews for card in self.cards])

    @property
    def reviews_today(self):
        return len([e for e in self.events if e.date == date.today()])


    @property
    def methods(self):
        methods = {card.method.title for card in self.cards}
        method_stats = []
        for method in methods:
            total = len([card for card in self.cards
                         if card.method.title == method])
            method_stats.append({
                'method': method,
                'total': total,
            })
        return method_stats



class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    method_name = db.Column(db.String())
    place_bell = db.Column(db.Integer)
    fk_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", back_populates="cards")

    on_deck = db.Column(db.Boolean, default=False)

    ease = db.Column(db.Float, default=1.2)
    interval = db.Column(db.Float, default=1.0)
    scheduled = db.Column(db.Date, default=date.today)
    learn_mode = db.Column(db.Integer, default=0)

    reviews = db.relationship("Event", back_populates="card")

    bumper_mode = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return "{} {}".format(self.method_name, self.place_bell)

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
            'bumper_mode': self.bumper_mode,
        }
        return card


    @property
    def card_meta(self):
        meta = {
            'method': self.method.title,
            'place_bell': self.place_bell,
            'scheduled': self.scheduled.isoformat(),
            'ease': self.ease,
        }
        return meta

    def reset(self):
        self.ease = 1.2
        self.interval = 1.0
        self.scheduled = date.today()
        self.learn_mode = 0
        self.on_deck = False
        for e in self.reviews:
            db.session.delete(e)
        db.session.commit()

    def is_new(self):
        return len(self.reviews) == 0

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fk_card_id = db.Column(db.Integer, db.ForeignKey('card.id'))
    card = db.relationship("Card", back_populates="reviews")
    date = db.Column(db.Date)
    last_interval = db.Column(db.Integer)


def schedule_card(card, faults=0):

    # Create an event for the card
    e = Event(card=card, date=date.today(), last_interval=int(card.interval))
    db.session.add(e)

    # Redo case: The card went poorly, so review it again today
    if faults >= 5:
        print('Scheduled {}: Redo case'.format(card.id))
        if card.learn_mode >= 4:
            # Relearn: the card was out of learn, so start over
            card.learn_mode = 0 # Reset to learning mode
        else:
            # Advance learn mode
            card.learn_mode += 1
        card.ease = max(1.3, card.ease - 0.2) # decrease ease w/ minimum
        card.interval = min(7.0, card.interval) # decrease interval
        card.scheduled = date.today() # review it again today
        card.bumper_mode = True
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # New bumper case: If the card is in learn mode and in bumper,
    # Do it again today before advancing the schedule
    if card.learn_mode < 4 and card.bumper_mode:
        print('Scheduled {}: Bumper case'.format(card.id))
        card.bumper_mode = False
        card.scheduled = date.today()
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # We're not doing the card again today, so we can unmark it
    card.on_deck = False

    # Learn case: The card is in learn mode, so just follow the sequence
    if card.learn_mode < 4:
        print('Scheduled {}: Learn case'.format(card.id))
        interval = [1,1,2,2][card.learn_mode]
        card.learn_mode += 1 # Advance to the next stage
        card.scheduled = date.today() + timedelta(days=interval)
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # Bad case
    if faults >= 3:
        print('Scheduled {}: Bad case'.format(card.id))
        card.ease = max(1.3, card.ease - 0.15) # decrease ease w/ minimum
        card.interval = card.interval * 1.2
        card.scheduled = date.today() + timedelta(days=int(card.interval))
        db.session.commit()
        return card

    # Good case
    if faults >= 1:
        print('Scheduled {}: Good case'.format(card.id))
        # Ease unchanged
        card.interval = card.interval * card.ease
        card.scheduled = date.today() + timedelta(days=int(card.interval))
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # Easy case
    print('Scheduled {}: Easy case'.format(card.id))
    card.ease += 0.1
    card.interval *= card.ease
    card.scheduled = date.today() + timedelta(days=int(card.interval))
    print('...scheduled for {}'.format(card.scheduled))
    db.session.commit()
    return card
