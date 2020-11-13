from flask import send_from_directory, render_template, jsonify, request
from app import app
from app.models import User
from random import shuffle

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../svelte/public/', path)

@app.route("/")
def index():
    return render_template('methodcards.html')


# API

@app.route("/api/card/<int:card_id>", methods=["GET"])
def get_card(card_id):
    user = User.query.get(1)

    if len(user.today()) == 0:
        return None

    card = user.get_card(card_id)
    return jsonify(card.card_dict)

@app.route("/api/card/<int:card_id>", methods=["POST"])
def report_result(card_id):
    user = User.query.get(1) # use the default user for testing purposes

    faults = request.json['faults']
    print("{} faults reported".format(faults))

    user.mark_card(card_id, faults)
    print(user.today())
    return "good"

@app.route("/api/today", methods=["GET"])
def get_today():
    user = User.query.get(1)
    cards = [{'card_id': card.id} for card in user.today()]
    if not cards:
        return jsonify([])
    shuffle(cards)
    return jsonify(cards)
