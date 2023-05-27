from flask import (
    Blueprint, current_app, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from flaskr.db import get_db
from flaskr.model.seat import Seat

bp = Blueprint('seat', __name__)

@bp.route('/new', methods=["POST"])
def new():
    if not "nickname" in request.args:
        abort(400, "nickname is required")
    db = get_db()
    
    seat = Seat(current_app.config["STARTING_STACK"], request.args["nickname"])
        
    try:
        db.cursor().execute("INSERT INTO seat (id, stack, nickname) VALUES (%s, %s, %s)", (seat.id, seat.stack, seat.nickname))
        db.commit()
    except Exception as e:
        abort(500, e)
    else:
        return {
                "id": seat.id,
                "stack": seat.stack,
                "nickname": seat.nickname
                }
