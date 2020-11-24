from flask import send_from_directory, render_template, jsonify, request, redirect, url_for
from app import app, db
from flask_login import current_user, login_required, login_user, logout_user
from app.models import User
from random import choice
import cccbr_methods
import requests
from base64 import b64encode

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../svelte/public/', path)

@app.route("/")
@login_required
def index():
    return render_template('methodcards.html',
                           user_email=current_user.email)

@app.route("/login", methods=["GET"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route("/api/login", methods=["POST"])
def api_login():
    email, password = request.json['email'], request.json['password']
    remember = request.json['remember']
    print('received:', email, password)

    resp = requests.post('https://ringingroom.com/api/tokens',
                         auth=(email,password))

    print(resp.status_code)

    if resp.status_code == 401:
        print('bad response')
        return jsonify({"success": False})

    print('good response')

    u = User.query.filter_by(email=email).first()
    if not u:
        u = User(email=email)
        db.session.add(u)
        db.session.commit()

    print('u', u)

    login_user(u, remember=remember)

    print('logged in:', current_user.id)

    return jsonify({'success': True})

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()

    return jsonify({'logout': True})


# API

@app.route("/api/card/<int:card_id>", methods=["GET"])
def get_card(card_id):

    if len(current_user.today()) == 0:
        return None

    card = current_user.get_card(card_id)
    return jsonify(card.card_dict)

@app.route("/api/next", methods=["GET"])
def get_next():

    print('Today: ', current_user.today())

    if len(current_user.today()) > 0:
        card = choice(current_user.today()).card_dict
    else:
        card = {'id': None}
    return jsonify({
        'card': card,
        'cards_remaining': len(current_user.today()),
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

    faults = request.json['faults']
    print("{} faults reported".format(faults))

    current_user.mark_card(card_id, faults)
    return jsonify({'result': 'ok'})

@app.route("/api/cards", methods=['GET'])
def get_all_cards():

    all_cards = [c.card_meta for c in current_user.cards]
    return jsonify(all_cards)

@app.route("/api/user/methods", methods=['GET'])
def get_user_methods():
    return jsonify(current_user.methods)

@app.route("/api/user/methods", methods=['POST'])
def add_user_method():
    method_name = request.json['method_name']
    print('Adding method: ', method_name)
    current_user.add_method(method_name)

    return jsonify({'result': 'ok'})

@app.route("/api/user/methods", methods=['DELETE'])
def delete_user_method():
    method_name = request.json['method_name']
    current_user.remove_method(method_name)
    return jsonify({'result': 'ok'})

@app.route("/api/user/settings", methods=["GET"])
def get_user_settings():
    response = {
        'max_reviews': current_user.max_reviews,
        'max_new': current_user.max_new,
        'unlimited_reviews': current_user.unlimited_reviews,
        'unlimited_new': current_user.unlimited_new,
    }
    return jsonify(response)

@app.route("/api/user/settings", methods=["POST"])
def post_user_settings():
    print('Got settings:', request.json)
    current_user.max_reviews = request.json['max_reviews']
    current_user.max_new = request.json['max_new']
    current_user.unlimited_reviews = request.json['unlimited_reviews']
    current_user.unlimited_new = request.json['unlimited_new']
    db.session.commit()
    return jsonify({'result': 'ok'})

