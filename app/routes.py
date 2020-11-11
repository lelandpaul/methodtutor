from flask import send_from_directory, render_template, jsonify
from app import app
import cccbr_methods

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../svelte/public/', path)

@app.route("/")
def index():
    return render_template('methodcards.html')

cur_method = cccbr_methods.get('Bristol Surprise Major')

def decide_direction(cur_pn, place):
    special_notations = {'0': 10,
                         'E': 11,
                         'T': 12,
                         'A': 13,
                         'B': 14,
                         'C': 15,
                         'D': 16}

    if cur_pn == '-':
        cur_pn = [0]
    else:
        cur_pn = [special_notations[p] if p in special_notations else int(p)
                for p in cur_pn]
    if place in cur_pn:
        # Easy case: make the place
        return 0
    p_below = [p for p in [0] + cur_pn if p < place][-1]
    dif = place - p_below
    if dif % 2 == 1:
        # Hunt up
        return 1
    # Hunt down
    return -1

def make_path(pn, pos):
    path = []
    for p in pn:
        direction = decide_direction(p, pos)
        pos += direction
        path.append(direction)
    return path



@app.route("/get_line/<int:bell>")
def get_line(bell):
    return jsonify(make_path(cur_method.full_notation.split('.'), bell))
