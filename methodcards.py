from app import app, db
from app.models import User, Card, Event

@app.shell_context_processor
def make_shell_context():
    return {'db': db,
            'User': User,
            'Card': Card,
            'Event': Event,
            'u': User.query.get(1)}

if __name__ == '__main__':
    app.run()

