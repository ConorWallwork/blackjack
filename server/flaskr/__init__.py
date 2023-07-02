import os

from flask import Flask
from flask_cors import CORS



def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_pyfile('config.py', silent=True)
    
    CORS(app)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from .controller import seat, leaderboard
    app.register_blueprint(seat.bp, url_prefix="/seat")
    app.register_blueprint(leaderboard.bp, url_prefix="/leaderboard")


    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    from . import db
    db.init_app(app)

    return app


app = create_app()
