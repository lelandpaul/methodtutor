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
            c = Card(method_name = method.title,
                     place_bell = i,
                     user = self)
            schedule_card(c)
            db.session.add(c)
        db.session.commit()

    def today(self):
        return [c for c in self.cards if c.scheduled <= date.today()]

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



class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    method_name = db.Column(db.String())
    place_bell = db.Column(db.Integer)
    fk_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", back_populates="cards")

    ease = db.Column(db.Float, default=1.2)
    interval = db.Column(db.Float, default=1.0)
    scheduled = db.Column(db.Date)
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
            'scheduled': self.scheduled,
            'ease': self.ease,
        }
        return meta

    def reset(self):
        self.ease = 1.2
        self.interval = 1.0
        self.scheduled = date.today()
        self.learn_mode = 0


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fk_card_id = db.Column(db.Integer, db.ForeignKey('card.id'))
    card = db.relationship("Card", back_populates="reviews")
    date = db.Column(db.Date)
    last_interval = db.Column(db.Integer)


def schedule_card(card, faults=0):

    # First case: If the card is brand new, schedule it for today.
    if card.scheduled is None:
        print('Scheduled {}: New case'.format(card.id))
        card.scheduled = date.today()
        db.session.commit()
        return card

    # If the card isn't brand-new, we need to create an event for it
    e = Event(card=card, date=date.today(), last_interval=int(card.interval))
    db.session.add(e)

    # Second case: The card is in learn mode, so just follow the sequence
    # Also take it out of bumper mode
    if card.learn_mode < 4:
        print('Scheduled {}: Learn case'.format(card.id))
        interval = [1,1,2,2][card.learn_mode]
        card.learn_mode += 1 # Advance to the next stage
        card.scheduled += timedelta(days=interval)
        card.bumper_mode = False
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # Third case: Relearn
    if faults >= 5:
        print('Scheduled {}: Relearn case'.format(card.id))
        card.learn_mode = 0 # Reset to learning mode
        card.ease = max(1.3, card.ease - 0.2) # decrease ease w/ minimum
        card.interval = min(7.0, card.interval) # decrease interval
        card.scheduled = date.today() # review it again today
        card.bumper_mode = True
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # Fourth case: Bad
    if faults >= 3:
        print('Scheduled {}: Bad case'.format(card.id))
        card.ease = max(1.3, card.ease - 0.15) # decrease ease w/ minimum
        card.interval = card.interval * 1.2
        card.scheduled += timedelta(days=int(card.interval))
        db.session.commit()
        return card

    # Fifth case: Good
    if faults >= 1:
        print('Scheduled {}: Good case'.format(card.id))
        # Ease unchanged
        card.interval = card.interval * card.ease
        card.scheduled += timedelta(days=int(card.interval))
        print('...scheduled for {}'.format(card.scheduled))
        db.session.commit()
        return card

    # Sixth case: Easy
    print('Scheduled {}: Easy case'.format(card.id))
    card.ease += 0.1
    card.interval *= card.ease
    card.scheduled += timedelta(days=int(card.interval))
    print('...scheduled for {}'.format(card.scheduled))
    db.session.commit()
    return card

