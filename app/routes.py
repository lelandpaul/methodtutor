from flask import send_from_directory, render_template, jsonify
from app import app
from app.methods import make_path, get_pn
from app.decks import Deck

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../svelte/public/', path)

@app.route("/")
def index():
    return render_template('methodcards.html')


@app.route("/get_line/<string:method>/<int:bell>")
def get_line(method, bell):
    pn = get_pn(method)
    return jsonify(make_path(pn, bell))

deck = Deck('test')
deck.add_method('Cambridge Surprise Minor')

@app.route("/get_next_card")
def get_next_card():
    return jsonify(deck.pick_card())
