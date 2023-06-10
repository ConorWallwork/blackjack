import json
from flask import (
    Blueprint, current_app, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from flaskr.db import get_db
from flaskr.model.round import Round
from flaskr.model.seat import Seat

bp = Blueprint('seat', __name__)


@bp.route('/new', methods=["POST"])
def new():
    if not "nickname" in request.args:
        abort(400, "nickname is required")

    seat = Seat(current_app.config["STARTING_STACK"], request.args["nickname"])

    try:
        db = get_db()
        db.cursor().execute("INSERT INTO seat (id, stack, nickname) VALUES (%s, %s, %s)",
                            (seat.id, seat.stack, seat.nickname))
        db.commit()
    except Exception as e:
        abort(500, e)
    else:
        return { "id": seat.id }

@bp.route('<string:id>')
def get(id):
    seat = get_seat(id)

    if seat is None:
        abort(404, "seat with this ID does not exist")

    return  { "nickname": seat.nickname, "id": seat.id, "stack": seat.stack }


@bp.route('<string:id>/start', methods=["POST"])
def start(id):
    if not 'bet' in request.args:
        abort(400, "bet is required")

    seat = get_seat(id)

    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    seat.set_round(active_round)
    try:
        starting_cards = seat.round_start(int(request.args['bet']))
        db = get_db()
        db.cursor().execute("INSERT INTO round (seat_id, player_hand, dealer_hand, deck, stage, bet) VALUES (%s, %s, %s, %s, %s, %s)", (id,
                                                                                                                                        json.dumps(seat.round.player_hand), json.dumps(seat.round.dealer_hand), json.dumps(seat.round.deck), seat.round.stage, seat.round.bet))
        db.commit()
        return starting_cards
    except Exception as e:
        abort(400, e)


@bp.route('<string:id>/hit', methods=["POST"])
def hit(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        card = seat.round_hit()
        if seat.round.stage == 'round_end':
            # The stack has changed, update seat in db
            update_seat(seat)
        update_round(seat.round)
        return json.dumps(card)
    except Exception as e:
        abort(400, e)


@bp.route('<string:id>/sit', methods=["POST"])
def sit(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        seat.round_sit()
        update_round(seat.round)
        return ('', 204)
    except Exception as e:
        abort(400, e)


@bp.route('<string:id>/end', methods=["POST"])
def end(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        dealer_cards = seat.round_end()
        update_seat(seat)
        update_round(seat.round)
        return dealer_cards
    except Exception as e:
        abort(400, e)


def get_seat(id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT id, stack, nickname FROM seat WHERE id=%s", (id,))
    except Exception as e:
        abort(500, e + f'Statement: {cursor.statement}')
    row = cursor.fetchone()
    return None if row is None else Seat(row[1], row[2], id=row[0])


def get_active_round(seat):
    cursor = get_db().cursor()
    try:
        cursor.execute(
            "SELECT bet, player_hand, dealer_hand, deck, stage, id FROM round WHERE seat_id=%s AND stage != 'round_end'", (seat.id,))
    except Exception as e:
        abort(500, e)
    row = cursor.fetchone()
    return None if row is None else Round(row[0], json.loads(row[1]), json.loads(row[2]), json.loads(row[3]), row[4], int(row[5]))


def update_seat(seat):
    db = get_db()
    db.cursor().execute("UPDATE seat SET stack = %s WHERE id=%s", (seat.stack, seat.id))
    db.commit()


def update_round(round):
    db = get_db()
    db.cursor().execute("UPDATE round SET player_hand = %s, dealer_hand = %s, deck = %s, stage = %s WHERE id=%s",
                        (json.dumps(round.player_hand), json.dumps(round.dealer_hand), json.dumps(round.deck), round.stage, round.id))
    db.commit()
