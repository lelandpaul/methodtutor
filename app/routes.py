from flask import send_from_directory, render_template, jsonify
from app import app
from app.methods import make_path, get_pn, get_card
from random import choice

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

@app.route("/get_next_card")
def get_next_card():
    place_bell = choice(range(2,9))
    method = choice(['Bristol Surprise Major', 'Cambridge Surprise Major'])
    return jsonify(get_card(method, place_bell))
