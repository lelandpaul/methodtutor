from flask import send_from_directory, render_template, jsonify, request
from app import app
from app.methods import make_path, get_pn
from app.models import User, Card
from random import choice

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../svelte/public/', path)

@app.route("/")
def index():
    return render_template('methodcards.html')


# API

@app.route("/api/<int:deck_id>/card", methods=["GET"])
def get_card(deck_id=0):
    user = User.query.get(0)

    if len(user.today()) == 0:
        return jsonify({ 'id': 0,
                         'method': 'All done!',
                         'stage': 8,
                         'treble_path': [],
                         'place_bell': 1,
                         'blueline': [],
                         'lead_length': 32,
                    })


    card = choice(user.today())
    return jsonify(card.card_dict)

@app.route("/api/<int:deck_id>/card", methods=["POST"])
def report_result(deck_id=0):
    user = User.query.get(0) # use the default user for testing purposes
    card_id = request.json['card_id']
    user.mark_card(card_id)
    print(user.today())
    return "good"

@app.route("/api/<int:deck_id>/today", methods=["GET"])
def get_today(deck_id=0):
    user = User.query.get(0)
    return jsonify({'cards_remaining': len(user.today())})

