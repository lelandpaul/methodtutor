from flask import send_from_directory, render_template, jsonify, request
from app import app
from app.models import User
from random import choice
import cccbr_methods

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

@app.route("/api/next", methods=["GET"])
def get_next():
    user = User.query.get(1)

    if len(user.today()) > 0:
        card = choice(user.today()).card_dict
    else:
        card = {'id': None}
    return jsonify({
        'card': card,
        'cards_remaining': len(user.today()),
    })

@app.route("/api/methods", methods=["POST"])
def get_methods():
    keyword = request.json['keyword']
    results = {
        'results': [
            {
                'id': i,
                'method_name': method.title,
            }
            for i, method in enumerate(cccbr_methods.search(keyword))
        ]
    }
    return jsonify(results)

@app.route("/api/card/<int:card_id>", methods=["POST"])
def report_result(card_id):
    user = User.query.get(1) # use the default user for testing purposes

    faults = request.json['faults']
    print("{} faults reported".format(faults))

    user.mark_card(card_id, faults)
    print(user.today())
    return "good"

@app.route("/api/cards", methods=['GET'])
def get_all_cards():
    user = User.query.get(1)

    all_cards = [c.card_meta for c in user.cards]
    return jsonify(all_cards)

@app.route("/api/user/methods", methods=['GET'])
def get_user_methods():
    user = User.query.get(1)
    return jsonify(user.methods)

@app.route("/api/user/methods", methods=['POST'])
def add_user_method():
    user = User.query.get(1)
    method_name = request.json['method_name']
    print('Adding method: ', method_name)
    user.add_method(method_name)

    return jsonify({'result': 'ok'})

@app.route("/api/user/methods", methods=['DELETE'])
def delete_user_method():
    user = User.query.get(1)
    method_name = request.json['method_name']
    user.remove_method(method_name)
    return 'good'

