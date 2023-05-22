from flask import Flask, jsonify, request
from ..model.session import Session

app = Flask(__name__)

## route /new -> returns uuid
## route /game/<id>/<action> -> returns game info


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/new")
def new():
    name = request.args.get('name')
    session = Session(300, name)
    return jsonify(session.session_id)
